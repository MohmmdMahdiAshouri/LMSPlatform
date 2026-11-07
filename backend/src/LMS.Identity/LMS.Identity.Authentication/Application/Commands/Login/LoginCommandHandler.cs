using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.Login;

public sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    IAuthSessionCoordinator authSessionCoordinator,
    ISystemClock clock,
    ILogger<LoginCommandHandler> logger) : ICommandHandler<LoginCommand, LoginResult>
{
    public async Task<Result<LoginResult>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedIdentifier = request.Identifier?.Trim() ?? string.Empty;

        User? user = null;
        if (Email.TryCreate(normalizedIdentifier, out var email))
        {
            user = await userRepository.FindByEmailAsync(email, cancellationToken);
        }
        else if (Username.TryCreate(normalizedIdentifier, out var username))
        {
            user = await userRepository.FindByUsernameAsync(username, cancellationToken);
        }

        if (user is null)
        {
            logger.LogWarning("Login failed: Identifier '{Identifier}' was not found.", normalizedIdentifier);
            return Result.Failure<LoginResult>(
                Error.Unauthorized(ErrorCode.InvalidCredentials, "Invalid email/username or password."));
        }

        if (!user.HasPassword())
        {
            logger.LogWarning("Login failed: User '{UserId}' has no password (registered via Google).", user.Id);
            return Result.Failure<LoginResult>(
                Error.Unauthorized(ErrorCode.PasswordLoginNotAvailable, "This account was registered using Google. Please log in with Google."));
        }

        if (user.IsLocked(clock))
        {
            logger.LogWarning("Login failed: User '{UserId}' account is locked until {LockedUntil}.", user.Id, user.LockedUntil);
            return Result.Failure<LoginResult>(
                Error.Unauthorized(ErrorCode.InvalidCredentials, "Invalid email/username or password."));
        }

        if (!user.IsActive())
        {
            logger.LogWarning("Login failed: User '{UserId}' status is '{Status}'.", user.Id, user.Status);
            return Result.Failure<LoginResult>(
                Error.Unauthorized(ErrorCode.InvalidCredentials, "Invalid email/username or password."));
        }

        var isPasswordValid = passwordHasher.Verify(request.Password, user.PasswordHash!);
        if (!isPasswordValid)
        {
            user.RecordFailedLogin(clock);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogWarning(
                "Login failed: Incorrect password for User '{UserId}'. Consecutive failed attempts: {Attempts}.",
                user.Id,
                user.FailedLoginAttempts);

            return Result.Failure<LoginResult>(
                Error.Unauthorized(ErrorCode.InvalidCredentials, "Invalid email/username or password."));
        }

        user.RecordSuccessfulLogin(clock);

        var tokens = await authSessionCoordinator.IssueSessionAsync(
            user,
            request.IpAddress,
            request.UserAgent,
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User '{UserId}' logged in successfully on session '{SessionId}'.", user.Id, tokens.SessionId);

        return Result.Success(new LoginResult(tokens.AccessToken, tokens.RefreshToken));
    }
}
