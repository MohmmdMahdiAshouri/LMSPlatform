using System.Collections.Concurrent;
using System.Linq.Expressions;
using System.Reflection;
using FluentValidation;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Exceptions;
using LMS.Shared.Common.Results;
using MediatR;

namespace LMS.Shared.Application.Behaviors;

/// <summary>
/// Pipeline behavior that runs registered FluentValidation validators for CQRS requests.
/// If validation fails, it returns a Failure Result (if TResponse is Result) or throws ValidationException.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private static readonly ConcurrentDictionary<Type, Func<Error, object>> FailureFactories = new();

    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .GroupBy(f => string.IsNullOrWhiteSpace(f.PropertyName) ? "General" : f.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(f => f.ErrorMessage).Distinct().ToArray());

        if (failures.Count == 0)
        {
            return await next();
        }

        var validationError = Error.Validation("One or more validation failures have occurred.", failures);

        // 1. If TResponse is Result<T>, return Result<T>.Failure(error) via cached compiled delegate
        if (typeof(TResponse).IsGenericType && typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
        {
            var factory = FailureFactories.GetOrAdd(typeof(TResponse), CreateFailureFactory);
            return (TResponse)factory(validationError);
        }

        // 2. If TResponse is non-generic Result, return Result.Failure(error)
        if (typeof(TResponse) == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(validationError);
        }

        // 3. Otherwise throw domain ValidationException (handled by GlobalExceptionHandler)
        throw new LMS.Shared.Common.Exceptions.ValidationException(failures);
    }

    private static Func<Error, object> CreateFailureFactory(Type responseType)
    {
        var valueType = responseType.GetGenericArguments()[0];
        var failureMethod = typeof(Result<>)
            .MakeGenericType(valueType)
            .GetMethod(nameof(Result<object>.Failure), BindingFlags.Public | BindingFlags.Static, [typeof(Error)])!;

        var param = Expression.Parameter(typeof(Error), "error");
        var call = Expression.Call(failureMethod, param);
        var cast = Expression.Convert(call, typeof(object));
        return Expression.Lambda<Func<Error, object>>(cast, param).Compile();
    }
}
