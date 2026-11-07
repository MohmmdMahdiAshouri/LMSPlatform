namespace LMS.Identity.Authentication.Application.Commands.Login;

public sealed record LoginResult(
    string AccessToken,
    string RefreshToken);
