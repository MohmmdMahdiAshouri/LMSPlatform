using FluentValidation;
using LMS.Identity.Authentication.Domain.ValueObjects;

namespace LMS.Identity.Authentication.Application.Commands.ChangePassword;

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(Password.MinLength).WithMessage($"Password must be at least {Password.MinLength} characters.")
            .MaximumLength(Password.MaxLength).WithMessage($"Password cannot exceed {Password.MaxLength} characters.")
            .Matches(Password.RegexPattern).WithMessage("Password must include uppercase, lowercase, digit, and a special character.")
            .NotEqual(x => x.CurrentPassword).WithMessage("New password cannot be the same as your current password.");
    }
}
