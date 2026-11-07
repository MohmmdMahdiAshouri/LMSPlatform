using System.Security.Claims;
using System.Text;
using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Application.Commands.GoogleLogin;
using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Infrastructure.Persistence;
using LMS.Identity.Authentication.Infrastructure.Persistence.Repositories;
using LMS.Identity.Authentication.Infrastructure.Services;
using LMS.Shared.Common.Correlation;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Primitives;
using LMS.Shared.Domain.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace LMS.Identity.Authentication.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAuthenticationInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SqlServer")
            ?? throw new InvalidOperationException("Connection string 'SqlServer' not found.");

        services.AddDbContext<AuthenticationDbContext>((sp, options) =>
        {
            options.UseSqlServer(connectionString);
            options.AddInterceptors(sp.GetRequiredService<LMS.Shared.Infrastructure.Persistence.Interceptors.ConvertDomainEventsToOutboxMessagesInterceptor>());
        });

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AuthenticationDbContext>());
        services.AddScoped<LMS.Shared.Infrastructure.Persistence.IOutboxDbContext>(sp => sp.GetRequiredService<AuthenticationDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<IVerificationTokenRepository, VerificationTokenRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();

        // Token & Session Infrastructure Services
        services.AddOptions<Options.JwtOptions>()
            .BindConfiguration(Options.JwtOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<Options.PasswordHasherOptions>()
            .BindConfiguration(Options.PasswordHasherOptions.SectionName)
            .ValidateDataAnnotations();

        services.AddOptions<Options.GoogleAuthOptions>()
            .BindConfiguration(Options.GoogleAuthOptions.SectionName);

        services.AddSingleton<IAccessTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<RefreshTokenService>();
        services.AddSingleton<IRefreshTokenService>(sp => sp.GetRequiredService<RefreshTokenService>());
        services.AddSingleton<ISecureTokenService>(sp => sp.GetRequiredService<RefreshTokenService>());
        services.AddSingleton<IDeviceDetector, DeviceDetector>();
        services.AddScoped<IAuthSessionCoordinator, LMS.Identity.Authentication.Application.Services.AuthSessionCoordinator>();

        services.Configure<Application.Options.AuthEmailOptions>(
            configuration.GetSection(Application.Options.AuthEmailOptions.SectionName));

        // JWT Bearer & Authorization Services
        services.AddLmsJwtAuthentication(configuration);

        return services;
    }

    public static IServiceCollection AddLmsJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection(Options.JwtOptions.SectionName);
        var jwtOptions = jwtSection.Get<Options.JwtOptions>()
            ?? throw new InvalidOperationException($"Configuration section '{Options.JwtOptions.SectionName}' is missing.");

        if (string.IsNullOrWhiteSpace(jwtOptions.JwtAccessSecret))
        {
            throw new InvalidOperationException("Authentication:JwtAccessSecret is not configured.");
        }

        var key = Encoding.UTF8.GetBytes(jwtOptions.JwtAccessSecret);

        var googleSection = configuration.GetSection(Options.GoogleAuthOptions.SectionName);
        var googleOptions = googleSection.Get<Options.GoogleAuthOptions>();

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = false;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtOptions.JwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtOptions.JwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero, // Prevent token lifetime grace-period extension
                RequireExpirationTime = true,
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role
            };

            options.Events = new JwtBearerEvents
            {
                OnChallenge = async context =>
                {
                    context.HandleResponse();

                    if (context.Response.HasStarted) return;

                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";

                    var correlationId = context.HttpContext.GetCorrelationId();
                    var userIp = context.HttpContext.Connection.RemoteIpAddress?.ToString();

                    var error = Error.Unauthorized(ErrorCode.Unauthorized, "Authentication is required to access this resource.");
                    var envelope = ApiEnvelope.FromError(error, correlationId, userIp);

                    await context.Response.WriteAsJsonAsync(envelope, SystemTextJson.DefaultOptions);
                },

                OnForbidden = async context =>
                {
                    if (context.Response.HasStarted) return;

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";

                    var correlationId = context.HttpContext.GetCorrelationId();
                    var userIp = context.HttpContext.Connection.RemoteIpAddress?.ToString();

                    var error = Error.Forbidden(ErrorCode.Forbidden, "You do not have permission to access this resource.");
                    var envelope = ApiEnvelope.FromError(error, correlationId, userIp);

                    await context.Response.WriteAsJsonAsync(envelope, SystemTextJson.DefaultOptions);
                },

                OnAuthenticationFailed = context =>
                {
                    if (context.Exception is SecurityTokenExpiredException)
                    {
                        context.Response.Headers.Append("Token-Expired", "true");
                    }
                    return Task.CompletedTask;
                }
            };
        })
        .AddCookie("ExternalCookie", options =>
        {
            options.Cookie.Name = ".LMS.External";
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
        });

        if (googleOptions is not null && !string.IsNullOrWhiteSpace(googleOptions.ClientId))
        {
            authBuilder.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
            {
                options.SignInScheme = "ExternalCookie";
                options.ClientId = googleOptions.ClientId;
                options.ClientSecret = googleOptions.ClientSecret;
                options.CallbackPath = googleOptions.CallbackPath;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.CorrelationCookie.SameSite = SameSiteMode.Lax;
                options.Scope.Add("email");
                options.Scope.Add("profile");
                options.AdditionalAuthorizationParameters.Add("prompt", "select_account");
                options.ClaimActions.MapJsonKey("picture", "picture");
                options.ClaimActions.MapJsonKey("email_verified", "email_verified");

                options.Events.OnTicketReceived = async context =>
                {
                    var mediator = context.HttpContext.RequestServices.GetRequiredService<ISender>();
                    var googleOpts = context.HttpContext.RequestServices.GetRequiredService<IOptions<Options.GoogleAuthOptions>>().Value;
                    var clock = context.HttpContext.RequestServices.GetRequiredService<LMS.Shared.Domain.Abstractions.ISystemClock>();
                    var env = context.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();

                    var principal = context.Principal;
                    var googleId = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                                   ?? principal?.FindFirst("sub")?.Value;
                    var email = principal?.FindFirstValue(ClaimTypes.Email)
                                ?? principal?.FindFirst("email")?.Value;
                    var name = principal?.FindFirstValue(ClaimTypes.Name)
                               ?? principal?.FindFirst("name")?.Value;
                    var picture = principal?.FindFirst("picture")?.Value;
                    var emailVerifiedClaim = principal?.FindFirst("email_verified")?.Value;
                    var emailVerified = bool.TryParse(emailVerifiedClaim, out var ev) && ev;

                    var ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString();
                    var userAgent = context.HttpContext.Request.Headers.UserAgent.ToString();

                    var command = new GoogleLoginCommand(
                        googleId ?? string.Empty,
                        email ?? string.Empty,
                        name,
                        picture,
                        emailVerified,
                        ipAddress,
                        userAgent);

                    var result = await mediator.Send(command, context.HttpContext.RequestAborted);
                    if (result.IsFailure || result.Value is null)
                    {
                        var errorMsg = Uri.EscapeDataString(result.Error?.Message ?? "Google authentication failed.");
                        context.Response.Redirect($"{googleOpts.SuccessRedirect}?error={errorMsg}");
                        context.HandleResponse();
                        return;
                    }

                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = !env.IsDevelopment(),
                        SameSite = SameSiteMode.Lax,
                        Expires = clock.UtcNow.Add(AuthPolicy.RefreshTokenLifetime),
                        Path = AuthPolicy.RefreshTokenCookiePath
                    };

                    context.Response.Cookies.Append(
                        AuthPolicy.RefreshTokenCookieName,
                        result.Value.RefreshToken,
                        cookieOptions);

                    context.Response.Redirect($"{googleOpts.SuccessRedirect}#accessToken={result.Value.AccessToken}");
                    context.HandleResponse();
                };

                options.Events.OnRemoteFailure = context =>
                {
                    var googleOpts = context.HttpContext.RequestServices.GetRequiredService<IOptions<Options.GoogleAuthOptions>>().Value;
                    var errorMsg = Uri.EscapeDataString(context.Failure?.Message ?? "Google authentication failed.");
                    context.Response.Redirect($"{googleOpts.SuccessRedirect}?error={errorMsg}");
                    context.HandleResponse();
                    return Task.CompletedTask;
                };
            });
        }

        services.AddAuthorization();

        return services;
    }
}
