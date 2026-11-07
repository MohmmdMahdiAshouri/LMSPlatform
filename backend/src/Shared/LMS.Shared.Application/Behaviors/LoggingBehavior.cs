using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace LMS.Shared.Application.Behaviors;

/// <summary>
/// Pipeline behavior that logs execution metrics, request names, and elapsed execution time.
/// </summary>
public sealed class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["Request"] = requestName
        });

        var stopwatch = Stopwatch.StartNew();
        _logger.LogDebug("Handling CQRS request: {Request}", requestName);

        try
        {
            var response = await next();
            stopwatch.Stop();

            _logger.LogInformation(
                "Handled CQRS request: {Request} in {ElapsedMilliseconds}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(
                ex,
                "Failed handling CQRS request: {Request} after {ElapsedMilliseconds}ms - {ErrorMessage}",
                requestName,
                stopwatch.ElapsedMilliseconds,
                ex.Message);

            throw;
        }
    }
}
