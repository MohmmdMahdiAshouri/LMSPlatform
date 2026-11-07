using FluentValidation;
using LMS.Identity.Authentication.Domain.ValueObjects;

namespace LMS.Identity.Authentication.WebApi.Dtos.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(Email.MaxLength)
            .EmailAddress().WithMessage("Email format is invalid.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .Length(Username.MinLength, Username.MaxLength)
            .WithMessage($"Username must be between {Username.MinLength} and {Username.MaxLength} characters.")
            .Must(u => !u.Contains("__"))
            .WithMessage("Username cannot contain consecutive underscores.")
            .Matches(Username.RegexPattern)
            .WithMessage("Username must start with a letter, may contain letters/digits/underscore, and must not end with an underscore.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .Length(Password.MinLength, Password.MaxLength)
            .WithMessage($"Password must be between {Password.MinLength} and {Password.MaxLength} characters.")
            .Matches(Password.RegexPattern)
            .WithMessage("Password must include uppercase, lowercase, digit, and a special character.");
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty().WithMessage("Email or username is required.")
            .MaximumLength(Email.MaxLength);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}