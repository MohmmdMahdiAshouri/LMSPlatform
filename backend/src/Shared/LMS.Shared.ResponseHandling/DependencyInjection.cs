using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Shared.ResponseHandling;

public static class DependencyInjection
{
    /// <summary>
    /// Registers required services for the unified LMS response envelope pipeline.
    /// </summary>
    public static IServiceCollection AddLmsResponseHandling(this IServiceCollection services)
    {
        services.AddScoped<LMS.Shared.Common.Correlation.CorrelationContext>();
        services.AddScoped<LMS.Shared.Common.Correlation.ICorrelationContext>(sp => 
            sp.GetRequiredService<LMS.Shared.Common.Correlation.CorrelationContext>());
        return services;
    }

    /// <summary>
    /// Adds the ResponseEnvelopeMiddleware to the application pipeline to automatically wrap
    /// responses into the canonical ApiEnvelope structure.
    /// </summary>
    public static IApplicationBuilder UseResponseEnvelopeMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ResponseEnvelopeMiddleware>();
    }
}
