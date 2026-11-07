using System.Security.Claims;
using System.Text;
using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Infrastructure.Options;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace LMS.Identity.Authentication.Infrastructure.Services;

public sealed class JwtTokenGenerator : IAccessTokenGenerator
{
    private readonly JwtOptions _options;
    private readonly ISystemClock _clock;
    private readonly SigningCredentials _signingCredentials;
    private readonly JsonWebTokenHandler _tokenHandler = new();

    public JwtTokenGenerator(
        IOptions<JwtOptions> jwtOptions,
        ISystemClock clock)
    {
        _options = jwtOptions.Value;
        _clock = clock;

        if (string.IsNullOrWhiteSpace(_options.JwtAccessSecret))
        {
            throw new InvalidOperationException("JWT access secret is not configured.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.JwtAccessSecret));
        _signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string GenerateToken(User user, Session session)
    {
        var claims = new Dictionary<string, object>
        {
            [JwtRegisteredClaimNames.Sub] = user.Id.ToString(),
            [JwtRegisteredClaimNames.Email] = user.Email.Value,
            [JwtRegisteredClaimNames.UniqueName] = user.Username.Value,
            ["sid"] = session.Id.ToString(),
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString()
        };

        var now = _clock.UtcNow.UtcDateTime;
        var expires = now.AddMinutes(_options.AccessTokenMinutes > 0 ? _options.AccessTokenMinutes : AuthPolicy.AccessTokenLifetime.TotalMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = claims,
            Expires = expires,
            IssuedAt = now,
            NotBefore = now,
            Issuer = _options.JwtIssuer,
            Audience = _options.JwtAudience,
            SigningCredentials = _signingCredentials
        };

        return _tokenHandler.CreateToken(tokenDescriptor);
    }
}
