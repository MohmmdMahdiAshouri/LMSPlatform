using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.VerifyEmail;

public sealed record VerifyEmailCommand(string VerificationToken) : ICommand;
