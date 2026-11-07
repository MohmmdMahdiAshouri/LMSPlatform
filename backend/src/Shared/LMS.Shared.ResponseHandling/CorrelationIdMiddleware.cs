using LMS.Shared.Common.Correlation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace LMS.Shared.ResponseHandling;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, CorrelationContext correlationContext)
    {
        var correlationId = context.Request.Headers[CorrelationConstants.HeaderName].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Guid.NewGuid().ToString("N");
        }

        correlationContext.CorrelationId = correlationId;
        context.Items[CorrelationConstants.ContextItemKey] = correlationId;
        context.Response.Headers[CorrelationConstants.HeaderName] = correlationId;

        await next(context);
    }
}

public static class CorrelationIdMiddlewareExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
    {
        return app.UseMiddleware<CorrelationIdMiddleware>();
    }
}
