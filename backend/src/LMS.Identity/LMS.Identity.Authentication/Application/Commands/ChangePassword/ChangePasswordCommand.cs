using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.ChangePassword;

public sealed record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : ICommand;
