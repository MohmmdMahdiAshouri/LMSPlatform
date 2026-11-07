namespace LMS.Identity.Authentication.Application.Commands.GoogleLogin;

public sealed record GoogleLoginResult(
    string AccessToken,
    string RefreshToken);
