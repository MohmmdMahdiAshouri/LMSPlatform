using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.Login;

public sealed record LoginCommand(
    string Identifier,
    string Password,
    string? IpAddress,
    string? UserAgent) : ICommand<LoginResult>;
