namespace LMS.Identity.Authentication.Application.Abstractions;

public interface ISecureTokenService
{
    string GenerateToken();
    string HashToken(string token);
}
