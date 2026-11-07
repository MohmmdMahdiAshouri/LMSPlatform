using LMS.Identity.Authentication.Domain.Constants;
using LMS.Shared.Domain.Abstractions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace LMS.Identity.Authentication.WebApi.Services;

public interface IAuthCookieService
{
    void SetRefreshToken(string refreshToken);
    void ClearRefreshToken();
    string? GetRefreshToken();
}

public sealed class AuthCookieService(
    IHttpContextAccessor httpContextAccessor,
    IWebHostEnvironment environment,
    ISystemClock clock) : IAuthCookieService
{
    public void SetRefreshToken(string refreshToken)
    {
        var response = httpContextAccessor.HttpContext?.Response;
        if (response is null) return;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = clock.UtcNow.Add(AuthPolicy.RefreshTokenLifetime),
            Path = AuthPolicy.RefreshTokenCookiePath
        };

        response.Cookies.Append(AuthPolicy.RefreshTokenCookieName, refreshToken, cookieOptions);
    }

    public void ClearRefreshToken()
    {
        var response = httpContextAccessor.HttpContext?.Response;
        if (response is null) return;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = clock.UtcNow.AddDays(-1),
            Path = AuthPolicy.RefreshTokenCookiePath
        };

        response.Cookies.Delete(AuthPolicy.RefreshTokenCookieName, cookieOptions);
        response.Cookies.Delete("refresh_token", cookieOptions);

        // Also clean up any legacy cookie that might have been stored with path /api/auth
        var legacyOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = clock.UtcNow.AddDays(-1),
            Path = "/api/auth"
        };
        response.Cookies.Delete(AuthPolicy.RefreshTokenCookieName, legacyOptions);
        response.Cookies.Delete("refresh_token", legacyOptions);
    }

    public string? GetRefreshToken()
    {
        var cookies = httpContextAccessor.HttpContext?.Request.Cookies;
        if (cookies is null) return null;

        return cookies[AuthPolicy.RefreshTokenCookieName] ?? cookies["refresh_token"];
    }
}
