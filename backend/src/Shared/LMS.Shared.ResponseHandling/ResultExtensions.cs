using LMS.Shared.Common.Correlation;
using LMS.Shared.Common.Primitives;
using LMS.Shared.Common.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Shared.ResponseHandling;

public static class ResultExtensions
{
    // ================= Minimal APIs (IResult) =================

    public static IResult ToApiResponse<T>(
        this Result<T> result,
        HttpContext? httpContext = null,
        int successStatusCode = StatusCodes.Status200OK,
        string successMessage = "OK")
    {
        var correlationId = httpContext.GetCorrelationId();
        var userIP = httpContext?.Connection.RemoteIpAddress?.ToString();

        if (result.IsSuccess)
        {
            var envelope = ApiEnvelope<T>.Ok(
                data: result.Value,
                message: successMessage,
                statusCode: successStatusCode,
                correlationId: correlationId,
                userIP: userIP);

            return Results.Json(envelope, SystemTextJson.DefaultOptions, statusCode: successStatusCode);
        }

        var error = result.Error!;
        var errorEnvelope = ApiEnvelope<T>.FromError(error, correlationId, userIP);

        return Results.Json(errorEnvelope, SystemTextJson.DefaultOptions, statusCode: error.HttpStatusCode);
    }

    public static IResult ToApiResponse(
        this Result result,
        HttpContext? httpContext = null,
        int successStatusCode = StatusCodes.Status200OK,
        string successMessage = "OK")
    {
        var correlationId = httpContext.GetCorrelationId();
        var userIP = httpContext?.Connection.RemoteIpAddress?.ToString();

        if (result.IsSuccess)
        {
            var envelope = ApiEnvelope.Ok(
                data: null,
                message: successMessage,
                statusCode: successStatusCode,
                correlationId: correlationId,
                userIP: userIP);

            return Results.Json(envelope, SystemTextJson.DefaultOptions, statusCode: successStatusCode);
        }

        var error = result.Error!;
        var errorEnvelope = ApiEnvelope.FromError(error, correlationId, userIP);

        return Results.Json(errorEnvelope, SystemTextJson.DefaultOptions, statusCode: error.HttpStatusCode);
    }

    // ================= MVC / API Controllers (IActionResult) =================

    public static IActionResult ToActionResult<T>(
        this Result<T> result,
        HttpContext? httpContext = null,
        int successStatusCode = StatusCodes.Status200OK,
        string successMessage = "OK")
    {
        var correlationId = httpContext.GetCorrelationId();
        var userIP = httpContext?.Connection.RemoteIpAddress?.ToString();

        if (result.IsSuccess)
        {
            var envelope = ApiEnvelope<T>.Ok(
                data: result.Value,
                message: successMessage,
                statusCode: successStatusCode,
                correlationId: correlationId,
                userIP: userIP);

            return new ObjectResult(envelope) { StatusCode = successStatusCode };
        }

        var error = result.Error!;
        var errorEnvelope = ApiEnvelope<T>.FromError(error, correlationId, userIP);

        return new ObjectResult(errorEnvelope) { StatusCode = error.HttpStatusCode };
    }

    public static IActionResult ToActionResult(
        this Result result,
        HttpContext? httpContext = null,
        int successStatusCode = StatusCodes.Status200OK,
        string successMessage = "OK")
    {
        var correlationId = httpContext.GetCorrelationId();
        var userIP = httpContext?.Connection.RemoteIpAddress?.ToString();

        if (result.IsSuccess)
        {
            var envelope = ApiEnvelope.Ok(
                data: null,
                message: successMessage,
                statusCode: successStatusCode,
                correlationId: correlationId,
                userIP: userIP);

            return new ObjectResult(envelope) { StatusCode = successStatusCode };
        }

        var error = result.Error!;
        var errorEnvelope = ApiEnvelope.FromError(error, correlationId, userIP);

        return new ObjectResult(errorEnvelope) { StatusCode = error.HttpStatusCode };
    }
}
