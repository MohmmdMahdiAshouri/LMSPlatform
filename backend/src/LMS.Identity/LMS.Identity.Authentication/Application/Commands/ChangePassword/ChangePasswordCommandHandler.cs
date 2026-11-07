using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    IUserRepository userRepository,
    ISessionRepository sessionRepository,
    ICurrentUser currentUser,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<ChangePasswordCommandHandler> logger) : ICommandHandler<ChangePasswordCommand>
{
    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        var currentSessionId = currentUser.SessionId;

        if (!userId.HasValue || !currentSessionId.HasValue)
        {
            logger.LogWarning("ChangePassword attempted without authenticated user context.");
            return Result.Failure(Error.Unauthorized("Authentication is required to change password."));
        }

        var user = await userRepository.FindByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            logger.LogError("Authenticated user '{UserId}' not found in database.", userId.Value);
            return Result.Failure(Error.NotFound("User", userId.Value.ToString()));
        }

        if (!user.HasPassword())
        {
            return Result.Failure(Error.BusinessRule(
                "This account uses external authentication and does not have a local password configured."));
        }

        if (!passwordHasher.Verify(request.CurrentPassword, user.PasswordHash!))
        {
            return Result.Failure(Error.Validation("CurrentPassword", "Current password is incorrect."));
        }

        if (passwordHasher.Verify(request.NewPassword, user.PasswordHash!))
        {
            return Result.Failure(Error.Validation("NewPassword", "New password cannot be the same as your current password."));
        }

        var newPasswordVo = Password.Create(request.NewPassword);
        var newPasswordHash = passwordHasher.Hash(newPasswordVo);

        user.ChangePassword(newPasswordHash, clock);
        await userRepository.UpdateAsync(user, cancellationToken);

        var activeSessions = await sessionRepository.FindActiveByUserIdAsync(userId.Value, cancellationToken);
        var revokedCount = 0;
        foreach (var session in activeSessions)
        {
            if (session.Id != currentSessionId.Value)
            {
                session.Revoke(clock);
                revokedCount++;
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "User '{UserId}' successfully changed password. Revoked {RevokedCount} other active session(s). Current session '{SessionId}' retained.",
            userId.Value,
            revokedCount,
            currentSessionId.Value);

        return Result.Success();
    }
}
