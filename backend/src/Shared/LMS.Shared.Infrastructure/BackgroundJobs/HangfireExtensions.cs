using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Shared.Infrastructure.BackgroundJobs;

public static class HangfireExtensions
{
    public static IServiceCollection AddLmsHangfire(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SqlServer")
            ?? throw new InvalidOperationException("Connection string 'SqlServer' not found for Hangfire.");

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
            {
                CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
                SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
                QueuePollInterval = TimeSpan.Zero, // Immediate pickup for enqueued jobs
                UseRecommendedIsolationLevel = true,
                DisableGlobalLocks = true // Uses modern fine-grained SQL Server row locks
            }));

        // Dedicated background job execution server
        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Math.Min(Environment.ProcessorCount * 2, 8);
            options.Queues = ["critical", "default", "outbox"];
        });

        return services;
    }

    public static IApplicationBuilder UseLmsHangfireDashboard(this IApplicationBuilder app)
    {
        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = [new HangfireDashboardAuthorizationFilter()],
            DashboardTitle = "LMS Platform — Background Jobs",
            DarkModeEnabled = true
        });

        return app;
    }
}
