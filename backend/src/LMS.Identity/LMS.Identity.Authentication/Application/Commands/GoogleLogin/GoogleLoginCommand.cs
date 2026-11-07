using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.GoogleLogin;

public sealed record GoogleLoginCommand(
    string GoogleId,
    string Email,
    string? Name,
    string? Picture,
    bool EmailVerified,
    string? IpAddress,
    string? UserAgent) : ICommand<GoogleLoginResult>;
