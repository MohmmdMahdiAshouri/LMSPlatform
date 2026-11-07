using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : ICommand;
