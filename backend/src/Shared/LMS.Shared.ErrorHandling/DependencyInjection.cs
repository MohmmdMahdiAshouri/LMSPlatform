using LMS.Shared.ErrorHandling.Translators;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Shared.ErrorHandling;

public static class DependencyInjection
{
    public static IServiceCollection AddLmsErrorHandling(
        this IServiceCollection services,
        DbProvider provider = DbProvider.SqlServer)
    {
        // Register appropriate DB exception translator
        switch (provider)
        {
            case DbProvider.SqlServer:
                services.AddSingleton<IDatabaseExceptionTranslator, SqlServerExceptionTranslator>();
                break;
            default:
                services.AddSingleton<IDatabaseExceptionTranslator, SqlServerExceptionTranslator>();
                break;
        }

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        return services;
    }
}
