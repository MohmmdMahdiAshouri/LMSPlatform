using System.Text;
using System.Text.Json;
using LMS.Shared.Common.Correlation;
using LMS.Shared.Common.Primitives;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LMS.Shared.ResponseHandling;

public sealed class ResponseEnvelopeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ResponseEnvelopeMiddleware> _logger;

    private static readonly HashSet<string> ExcludedPathPrefixes = new(StringComparer.OrdinalIgnoreCase)
    {
        "/openapi",
        "/scalar",
        "/swagger",
        "/hangfire",
        "/favicon.ico"
    };

    public ResponseEnvelopeMiddleware(
        RequestDelegate _next,
        ILogger<ResponseEnvelopeMiddleware> logger)
    {
        this._next = _next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Skip non-API or documentation routes
        if (IsExcluded(path))
        {
            await _next(context);
            return;
        }

        var originalBodyStream = context.Response.Body;
        await using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        try
        {
            await _next(context);

            memoryStream.Seek(0, SeekOrigin.Begin);

            // 1. Status codes with no body (204 No Content, 304 Not Modified, etc.) or redirects
            if (context.Response.StatusCode is StatusCodes.Status204NoContent
                or StatusCodes.Status304NotModified
                or >= 300 and < 400)
            {
                await memoryStream.CopyToAsync(originalBodyStream);
                return;
            }

            var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

            // 2. Already empty response
            if (string.IsNullOrWhiteSpace(responseBody))
            {
                if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
                {
                    var correlationId = context.GetCorrelationId();
                    var userIP = context.Connection.RemoteIpAddress?.ToString();
                    var emptyEnvelope = ApiEnvelope.Ok(
                        data: null,
                        statusCode: context.Response.StatusCode,
                        correlationId: correlationId,
                        userIP: userIP);

                    await WriteEnvelopeResponseAsync(context, originalBodyStream, emptyEnvelope);
                    return;
                }

                await memoryStream.CopyToAsync(originalBodyStream);
                return;
            }

            // 3. Check if response is already wrapped in ApiEnvelope (e.g. from GlobalExceptionHandler or explicit envelope)
            if (IsAlreadyEnveloped(responseBody))
            {
                memoryStream.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBodyStream);
                return;
            }

            // 4. Wrap successful 2xx response in ApiEnvelope
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                var correlationId = context.GetCorrelationId();
                var userIP = context.Connection.RemoteIpAddress?.ToString();

                object? data;
                try
                {
                    // Attempt to parse as valid JSON structure (object / array / primitive)
                    data = JsonSerializer.Deserialize<JsonElement>(responseBody, SystemTextJson.DefaultOptions);
                }
                catch
                {
                    // If not JSON, preserve as raw string
                    data = responseBody;
                }

                var envelope = ApiEnvelope.Ok(
                    data: data,
                    statusCode: context.Response.StatusCode,
                    correlationId: correlationId,
                    userIP: userIP);

                await WriteEnvelopeResponseAsync(context, originalBodyStream, envelope);
                return;
            }

            // If non-2xx reached here without being enveloped, write as is
            memoryStream.Seek(0, SeekOrigin.Begin);
            await memoryStream.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private static bool IsExcluded(string path)
    {
        foreach (var prefix in ExcludedPathPrefixes)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        return false;
    }

    private static bool IsAlreadyEnveloped(string responseBody)
    {
        var trimmed = responseBody.TrimStart();
        if (!trimmed.StartsWith('{')) return false;

        // Quick check for canonical properties
        return (trimmed.Contains("\"success\"", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Contains("\"Success\"", StringComparison.OrdinalIgnoreCase)) &&
               (trimmed.Contains("\"statusCode\"", StringComparison.OrdinalIgnoreCase) ||
                trimmed.Contains("\"StatusCode\"", StringComparison.OrdinalIgnoreCase));
    }

    private static async Task WriteEnvelopeResponseAsync<T>(
        HttpContext context,
        Stream destinationStream,
        ApiEnvelope<T> envelope)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var json = JsonSerializer.Serialize(envelope, SystemTextJson.DefaultOptions);
        var bytes = Encoding.UTF8.GetBytes(json);

        context.Response.ContentLength = bytes.Length;
        await destinationStream.WriteAsync(bytes);
    }
}
