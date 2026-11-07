using Microsoft.AspNetCore.Http;

namespace LMS.Shared.Common.Correlation;

public static class CorrelationExtensions
{
    public static string GetCorrelationId(this HttpContext? context)
    {
        if (context is null)
        {
            return Guid.NewGuid().ToString("N");
        }

        if (context.Items.TryGetValue(CorrelationConstants.ContextItemKey, out var itemVal) &&
            itemVal is string cid &&
            !string.IsNullOrWhiteSpace(cid))
        {
            return cid;
        }

        if (context.Request.Headers.TryGetValue(CorrelationConstants.HeaderName, out var headerVal) &&
            !string.IsNullOrWhiteSpace(headerVal))
        {
            return headerVal!;
        }

        return Guid.NewGuid().ToString("N");
    }
}
