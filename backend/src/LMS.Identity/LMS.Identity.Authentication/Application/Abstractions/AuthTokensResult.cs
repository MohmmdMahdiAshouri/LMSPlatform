namespace LMS.Identity.Authentication.Application.Abstractions;

public sealed record AuthTokensResult(
    string AccessToken,
    string RefreshToken,
    Guid SessionId);
