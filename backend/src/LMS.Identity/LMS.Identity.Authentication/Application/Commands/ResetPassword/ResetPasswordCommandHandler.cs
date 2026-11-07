using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.ResetPassword;

public sealed class ResetPasswordCommandHandler(
    IPasswordResetTokenRepository passwordResetTokenRepository,
    IUserRepository userRepository,
    ISessionRepository sessionRepository,
    ISecureTokenService secureTokenService,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<ResetPasswordCommandHandler> logger) : ICommandHandler<ResetPasswordCommand>
{
    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = secureTokenService.HashToken(request.Token);
        var resetToken = await passwordResetTokenRepository.FindByTokenHashAsync(tokenHash, cancellationToken);

        if (resetToken is null || !resetToken.IsUsable(clock))
        {
            logger.LogWarning("Attempted password reset with an invalid, expired, or already used token.");
            return Result.Failure(Error.BusinessRule("Password reset token is invalid, expired, or already used."));
        }

        var user = await userRepository.FindByIdAsync(resetToken.UserId, cancellationToken);
        if (user is null)
        {
            logger.LogError("User '{UserId}' associated with password reset token not found.", resetToken.UserId);
            return Result.Failure(Error.NotFound("User", resetToken.UserId.ToString()));
        }

        // Prevent reusing the exact same password
        if (user.HasPassword() && passwordHasher.Verify(request.NewPassword, user.PasswordHash!))
        {
            return Result.Failure(Error.Validation("NewPassword", "New password cannot be the same as your current password."));
        }

        // Hash the new password and apply to User
        var newPasswordVo = Password.Create(request.NewPassword);
        var newPasswordHash = passwordHasher.Hash(newPasswordVo);

        user.ChangePassword(newPasswordHash, clock);
        resetToken.Use(clock);

        await userRepository.UpdateAsync(user, cancellationToken);
        await passwordResetTokenRepository.UpdateAsync(resetToken, cancellationToken);

        // Security invariant: Revoke ALL active sessions for this user
        var activeSessions = await sessionRepository.FindActiveByUserIdAsync(user.Id, cancellationToken);
        foreach (var session in activeSessions)
        {
            session.Revoke(clock);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Successfully reset password for user '{UserId}' and revoked {Count} active session(s).",
            user.Id,
            activeSessions.Count);

        return Result.Success();
    }
}
