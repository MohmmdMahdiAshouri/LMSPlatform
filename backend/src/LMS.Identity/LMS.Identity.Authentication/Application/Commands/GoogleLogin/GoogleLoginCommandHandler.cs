using System.Text.RegularExpressions;
using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.GoogleLogin;

public sealed partial class GoogleLoginCommandHandler(
    IUserRepository userRepository,
    IAuthSessionCoordinator authSessionCoordinator,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<GoogleLoginCommandHandler> logger) : ICommandHandler<GoogleLoginCommand, GoogleLoginResult>
{
    public async Task<Result<GoogleLoginResult>> Handle(
        GoogleLoginCommand request,
        CancellationToken cancellationToken)
    {
        if (!request.EmailVerified)
        {
            logger.LogWarning("Google login rejected: email '{Email}' is not verified by Google.", request.Email);
            return Result.Failure<GoogleLoginResult>(
                Error.Validation("Email", "Google account email is not verified."));
        }

        // 1. Check if user already exists with this GoogleId
        var existingUser = await userRepository.FindByGoogleIdAsync(request.GoogleId, cancellationToken);
        if (existingUser is not null)
        {
            if (!existingUser.IsActive())
            {
                return Result.Failure<GoogleLoginResult>(
                    Error.Validation("Account", "User account is inactive."));
            }

            if (existingUser.IsLocked(clock))
            {
                return Result.Failure<GoogleLoginResult>(
                    Error.Validation("Account", "User account is temporarily locked."));
            }

            existingUser.RecordSuccessfulLogin(clock);
            await userRepository.UpdateAsync(existingUser, cancellationToken);

            var existingTokens = await authSessionCoordinator.IssueSessionAsync(
                existingUser,
                request.IpAddress,
                request.UserAgent,
                cancellationToken);

            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Existing user '{UserId}' logged in via Google.", existingUser.Id);

            return Result.Success(new GoogleLoginResult(existingTokens.AccessToken, existingTokens.RefreshToken));
        }

        // 2. Check for conflict with an existing email/password account
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var email = Email.Create(normalizedEmail);

        var userByEmail = await userRepository.FindByEmailAsync(email, cancellationToken);
        if (userByEmail is not null)
        {
            logger.LogWarning("Google login conflict: email '{Email}' already exists without Google link.", normalizedEmail);
            return Result.Failure<GoogleLoginResult>(
                Error.Conflict("An account with this email address already exists without Google login. Please log in with your password."));
        }

        // 3. Auto-register new user with pre-verified Google email
        var uniqueUsername = await GenerateUniqueUsernameAsync(normalizedEmail, cancellationToken);
        var newUser = User.RegisterWithGoogle(
            email,
            uniqueUsername,
            request.GoogleId,
            request.Picture,
            clock);

        await userRepository.AddAsync(newUser, cancellationToken);

        var newTokens = await authSessionCoordinator.IssueSessionAsync(
            newUser,
            request.IpAddress,
            request.UserAgent,
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("New user '{UserId}' auto-registered via Google.", newUser.Id);

        return Result.Success(new GoogleLoginResult(newTokens.AccessToken, newTokens.RefreshToken));
    }

    private async Task<Username> GenerateUniqueUsernameAsync(string emailStr, CancellationToken cancellationToken)
    {
        var emailPrefix = emailStr.Split('@')[0].ToLowerInvariant();
        var sanitized = SanitizationRegex().Replace(emailPrefix, "");

        if (string.IsNullOrWhiteSpace(sanitized) || !char.IsAsciiLetterLower(sanitized[0]))
        {
            sanitized = "u" + sanitized;
        }

        if (sanitized.Length < 3)
        {
            sanitized = $"{sanitized}_user";
        }

        if (sanitized.Length > 24)
        {
            sanitized = sanitized[..24];
        }

        var candidate = sanitized;
        var random = Random.Shared;

        while (await userRepository.UsernameExistsAsync(Username.Create(candidate), cancellationToken))
        {
            var suffix = random.Next(1000, 99999).ToString();
            candidate = $"{sanitized}_{suffix}";
            if (candidate.Length > 30) candidate = candidate[..30];
        }

        return Username.Create(candidate);
    }

    [GeneratedRegex("[^a-z0-9_]", RegexOptions.Compiled)]
    private static partial Regex SanitizationRegex();
}
