namespace LMS.Identity.Authentication.Application.Commands.Register;

public sealed record RegisterResult(
    string AccessToken,
    string RefreshToken);
