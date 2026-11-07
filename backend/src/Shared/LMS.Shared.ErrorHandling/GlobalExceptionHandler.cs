using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using LMS.Shared.Common.Correlation;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Exceptions;
using LMS.Shared.Common.Primitives;
using LMS.Shared.ErrorHandling.Translators;

namespace LMS.Shared.ErrorHandling;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _environment;
    private readonly IDatabaseExceptionTranslator _dbTranslator;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IHostEnvironment environment,
        IDatabaseExceptionTranslator dbTranslator)
    {
        _logger = logger;
        _environment = environment;
        _dbTranslator = dbTranslator;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Avoid handling if response has already started streaming
        if (httpContext.Response.HasStarted)
        {
            _logger.LogWarning(exception, "Response already started, unable to write exception response.");
            return false;
        }

        var correlationId = httpContext.GetCorrelationId();
        var userIP = httpContext.Connection.RemoteIpAddress?.ToString();

        // 1. Client disconnection / request cancellation
        if (exception is OperationCanceledException or TaskCanceledException)
        {
            _logger.LogInformation(
                "Request was canceled by the client. Path: {Path}, CorrelationId: {CorrelationId}",
                httpContext.Request.Path,
                correlationId);

            httpContext.Response.StatusCode = 499; // Client Closed Request
            return true;
        }

        // 2. Map exception to domain/platform Error
        var error = MapExceptionToError(exception, correlationId);

        // 3. Log diagnostics based on severity
        LogException(exception, error, correlationId, httpContext);

        // 4. Construct unified envelope response
        var envelope = ApiEnvelope.FromError(error, correlationId, userIP);

        httpContext.Response.StatusCode = error.HttpStatusCode;
        httpContext.Response.ContentType = "application/json";

        await JsonSerializer.SerializeAsync(
            httpContext.Response.Body,
            envelope,
            SystemTextJson.DefaultOptions,
            cancellationToken);

        return true;
    }

    private Error MapExceptionToError(Exception exception, string correlationId)
    {
        // A. Custom LMS Domain & Application Exceptions
        if (exception is LmsException lmsEx)
        {
            return lmsEx.ToError();
        }

        // B. FluentValidation ValidationException
        if (exception is FluentValidation.ValidationException fvEx)
        {
            var errors = fvEx.Errors
                .GroupBy(e => string.IsNullOrWhiteSpace(e.PropertyName) ? "General" : e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

            return Error.Validation("One or more validation failures have occurred.", errors);
        }

        // C. Database & EF Core Exceptions
        if (_dbTranslator.TryTranslate(exception, out var dbError))
        {
            return dbError;
        }

        // D. HTTP Framework Bad Request
        if (exception is BadHttpRequestException badHttpEx)
        {
            return Error.BadRequest(ErrorCode.BadRequest, badHttpEx.Message);
        }

        // E. Common .NET Argument / Invariant Exceptions (used by pure domain logic)
        if (exception is ArgumentNullException or ArgumentException)
        {
            return Error.BadRequest(ErrorCode.ArgumentInvalid, exception.Message);
        }

        if (exception is InvalidOperationException)
        {
            return Error.BadRequest(ErrorCode.InvalidOperation, exception.Message);
        }

        if (exception is UnauthorizedAccessException)
        {
            return Error.Unauthorized(ErrorCode.Unauthorized, "Unauthorized access.");
        }

        // F. Unhandled System / Server Exceptions (500)
        var metadata = new Dictionary<string, object?>
        {
            ["correlationId"] = correlationId
        };

        // In Development, attach debug details to metadata
        if (_environment.IsDevelopment())
        {
            metadata["exceptionType"] = exception.GetType().FullName;
            metadata["stackTrace"] = exception.StackTrace;
            if (exception.InnerException is not null)
            {
                metadata["innerException"] = exception.InnerException.Message;
            }
        }

        return Error.New(
            ErrorCode.Internal,
            "An unexpected internal server error occurred. Please contact support referencing this correlation ID.",
            (int)HttpStatusCode.InternalServerError,
            metadata);
    }

    private void LogException(
        Exception exception,
        Error error,
        string correlationId,
        HttpContext httpContext)
    {
        var path = httpContext.Request.Path;
        var method = httpContext.Request.Method;

        if (error.HttpStatusCode >= 500)
        {
            _logger.LogError(
                exception,
                "SERVER ERROR [{ErrorCode}] {Message} on {Method} {Path}. CorrelationId: {CorrelationId}",
                error.Code.Value,
                error.Message,
                method,
                path,
                correlationId);
        }
        else if (error.HttpStatusCode == 404)
        {
            _logger.LogInformation(
                "NOT FOUND [{ErrorCode}] {Message} on {Method} {Path}. CorrelationId: {CorrelationId}",
                error.Code.Value,
                error.Message,
                method,
                path,
                correlationId);
        }
        else
        {
            _logger.LogWarning(
                "CLIENT/DOMAIN ERROR [{ErrorCode}] {Message} ({StatusCode}) on {Method} {Path}. CorrelationId: {CorrelationId}",
                error.Code.Value,
                error.Message,
                error.HttpStatusCode,
                method,
                path,
                correlationId);
        }
    }
}
