namespace LMS.Identity.Authentication.Domain.Constants;

public static class AuthPolicy
{
    public const int MaxFailedLoginAttempts = 5;
    public static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);
    public static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(15);
    public static readonly TimeSpan VerificationTokenLifetime = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan VerificationResendCooldown = TimeSpan.FromMinutes(2);
    public const string RefreshTokenCookieName = "refreshToken";
    public const string RefreshTokenCookiePath = "/";
}
