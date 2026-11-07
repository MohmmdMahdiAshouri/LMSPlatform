using LMS.Identity.Authentication.Domain.ValueObjects;

namespace LMS.Identity.Authentication.Application.Abstractions;

public interface IPasswordHasher
{
    PasswordHash Hash(Password password);
    bool Verify(Password password, PasswordHash hash);
    bool Verify(string plainPassword, PasswordHash hash);
}

