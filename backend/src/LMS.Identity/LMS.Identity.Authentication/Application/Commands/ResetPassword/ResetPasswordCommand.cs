using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.ResetPassword;

public sealed record ResetPasswordCommand(string Token, string NewPassword) : ICommand;
