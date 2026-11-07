using FluentValidation;
using LMS.Identity.Authentication.Domain.ValueObjects;

namespace LMS.Identity.Authentication.Application.Commands.ResetPassword;

public sealed class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Reset token is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(Password.MinLength).WithMessage($"Password must be at least {Password.MinLength} characters.")
            .MaximumLength(Password.MaxLength).WithMessage($"Password cannot exceed {Password.MaxLength} characters.")
            .Matches(Password.RegexPattern).WithMessage("Password must include uppercase, lowercase, digit, and a special character.");
    }
}
