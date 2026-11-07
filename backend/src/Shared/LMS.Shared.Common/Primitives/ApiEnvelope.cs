using LMS.Shared.Common.Errors;
using System.Text.Json.Serialization;

namespace LMS.Shared.Common.Primitives;

/// <summary>
/// Generic standard API response envelope used across all endpoints.
/// Ensures all responses follow the canonical contract:
/// <code>{ success, statusCode, message, data, error, correlationId, userIP, timestamp }</code>
/// </summary>
public class ApiEnvelope<T>
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public ApiError? Error { get; init; }
    public string? CorrelationId { get; init; }
    public string? UserIP { get; init; }
    public DateTimeOffset Timestamp { get; init; }

    public static ApiEnvelope<T> Ok(
        T? data,
        string message = "OK",
        int statusCode = 200,
        string? correlationId = null,
        string? userIP = null)
        => new()
        {
            Success = true,
            StatusCode = statusCode,
            Message = message,
            Data = data,
            Error = null,
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };

    public static ApiEnvelope<T> Fail(
        string code,
        string message,
        int statusCode,
        string? correlationId = null,
        string? userIP = null,
        object? metadata = null)
        => new()
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = default,
            Error = new ApiError { Code = code, Metadata = metadata },
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };

    public static ApiEnvelope<T> FromError(
        Error error,
        string? correlationId = null,
        string? userIP = null,
        string? overrideMessage = null)
        => new()
        {
            Success = false,
            StatusCode = error.HttpStatusCode,
            Message = overrideMessage ?? error.Message,
            Data = default,
            Error = new ApiError
            {
                Code = error.Code.Value,
                Metadata = error.Metadata.Count == 0 ? null : error.Metadata
            },
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };
}

/// <summary>
/// Non-generic standard API response envelope.
/// </summary>
public sealed class ApiEnvelope : ApiEnvelope<object?>
{
    public static new ApiEnvelope Ok(
        object? data,
        string message = "OK",
        int statusCode = 200,
        string? correlationId = null,
        string? userIP = null)
        => new()
        {
            Success = true,
            StatusCode = statusCode,
            Message = message,
            Data = data,
            Error = null,
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };

    public static new ApiEnvelope Fail(
        string code,
        string message,
        int statusCode,
        string? correlationId = null,
        string? userIP = null,
        object? metadata = null)
        => new()
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = null,
            Error = new ApiError { Code = code, Metadata = metadata },
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };

    public static new ApiEnvelope FromError(
        Error error,
        string? correlationId = null,
        string? userIP = null,
        string? overrideMessage = null)
        => new()
        {
            Success = false,
            StatusCode = error.HttpStatusCode,
            Message = overrideMessage ?? error.Message,
            Data = null,
            Error = new ApiError
            {
                Code = error.Code.Value,
                Metadata = error.Metadata.Count == 0 ? null : error.Metadata
            },
            CorrelationId = correlationId,
            UserIP = userIP,
            Timestamp = DateTimeOffset.UtcNow
        };
}

public sealed class ApiError
{
    public string Code { get; init; } = string.Empty;

    [JsonPropertyName("metadata")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Metadata { get; init; }
}
