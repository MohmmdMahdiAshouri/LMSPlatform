using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.Register;

public sealed record RegisterCommand(
    string Email,
    string Username,
    string Password,
    string? IpAddress = null,
    string? UserAgent = null) : ICommand<RegisterResult>;
