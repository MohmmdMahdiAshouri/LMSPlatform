using BCrypt.Net;
using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Identity.Authentication.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace LMS.Identity.Authentication.Infrastructure.Services;

public sealed class BcryptPasswordHasher(IOptions<PasswordHasherOptions>? options = null) : IPasswordHasher
{
    private readonly int _workFactor = options?.Value.WorkFactor is >= 4 and <= 31 ? options.Value.WorkFactor : 12;

    public PasswordHash Hash(Password password)
    {
        var hashString = BCrypt.Net.BCrypt.EnhancedHashPassword(password.Value, _workFactor, HashType.SHA384);
        return PasswordHash.Create(hashString);
    }

    public bool Verify(Password password, PasswordHash hash)
    {
        return Verify(password.Value, hash);
    }

    public bool Verify(string plainPassword, PasswordHash hash)
    {
        if (string.IsNullOrEmpty(plainPassword)) return false;
        return BCrypt.Net.BCrypt.EnhancedVerify(plainPassword, hash.Value, HashType.SHA384);
    }
}
