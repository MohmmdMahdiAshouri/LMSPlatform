using LMS.Identity.Authentication.WebApi.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Identity.Authentication.WebApi;

public static class DependencyInjection
{
    public static IServiceCollection AddAuthenticationWebApi(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<IAuthCookieService, AuthCookieService>();
        return services;
    }
}
