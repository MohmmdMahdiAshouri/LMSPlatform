using LMS.Shared.Infrastructure.BackgroundJobs;
using LMS.Shared.Infrastructure.Persistence.Interceptors;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Shared.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLmsSharedInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 1. Universal Interceptor & Signal for Hybrid Transactional Outbox
        services.AddSingleton<IOutboxSignal, OutboxSignal>();
        services.AddSingleton<ConvertDomainEventsToOutboxMessagesInterceptor>();

        // 2. Hangfire Background Jobs Engine
        services.AddLmsHangfire(configuration);

        // 3. Outbox Processing Background Service
        services.Configure<OutboxOptions>(configuration.GetSection(OutboxOptions.SectionName));
        services.AddHostedService<OutboxProcessor>();

        // 4. Generic Email Service (MailKit SMTP)
        services.Configure<Email.SmtpOptions>(configuration.GetSection(Email.SmtpOptions.SectionName));
        services.AddTransient<Application.Abstractions.Email.IEmailSender, Email.MailKitEmailSender>();

        // 5. Current User & Security Context
        services.AddHttpContextAccessor();
        services.AddScoped<Application.Abstractions.Security.ICurrentUser, Security.CurrentUser>();

        return services;
    }
}
