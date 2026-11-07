using Hangfire.Dashboard;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LMS.Shared.Infrastructure.BackgroundJobs;

public sealed class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // In Development, allow local developers to inspect jobs freely
        var env = httpContext.RequestServices.GetRequiredService<IHostEnvironment>();
        if (env.IsDevelopment())
        {
            return true;
        }
        // In Production, require authenticated admin user
        return httpContext.User.Identity?.IsAuthenticated == true &&
            httpContext.User.IsInRole("Admin");
    }
}
