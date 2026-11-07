using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace LMS.Shared.Infrastructure.Security;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal? principal)
    {
        if (principal is null) return null;

        var rawId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? principal.FindFirstValue("sub");

        return Guid.TryParse(rawId, out var id) ? id : null;
    }

    public static Guid? GetSessionId(this ClaimsPrincipal? principal)
    {
        if (principal is null) return null;

        var rawSid = principal.FindFirstValue("sid");

        return Guid.TryParse(rawSid, out var sid) ? sid : null;
    }

    public static string? GetEmail(this ClaimsPrincipal? principal)
    {
        if (principal is null) return null;

        return principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? principal.FindFirstValue("email");
    }

    public static string? GetUsername(this ClaimsPrincipal? principal)
    {
        if (principal is null) return null;

        return principal.FindFirstValue(ClaimTypes.Name)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.UniqueName)
            ?? principal.FindFirstValue("unique_name");
    }

    public static bool IsAuthenticated(this ClaimsPrincipal? principal)
    {
        return principal?.Identity?.IsAuthenticated == true;
    }
}
