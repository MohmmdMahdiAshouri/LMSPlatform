using FluentValidation;

namespace LMS.Identity.Authentication.Application.Commands.VerifyEmail;

public sealed class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
{
    public VerifyEmailCommandValidator()
    {
        RuleFor(x => x.VerificationToken)
            .NotEmpty().WithMessage("Verification token is required.");
    }
}
