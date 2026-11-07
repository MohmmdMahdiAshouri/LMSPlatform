using System.Security.Cryptography;
using System.Text;
using LMS.Identity.Authentication.Application.Abstractions;

namespace LMS.Identity.Authentication.Infrastructure.Services;

public sealed class RefreshTokenService : IRefreshTokenService
{
    private const int TokenByteLength = 32;

    public string GenerateToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(TokenByteLength);
        return Convert.ToHexString(randomBytes).ToLowerInvariant();
    }

    public string HashToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Token cannot be null or empty.", nameof(token));
        }

        var inputBytes = Encoding.UTF8.GetBytes(token);
        var hashBytes = SHA256.HashData(inputBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
