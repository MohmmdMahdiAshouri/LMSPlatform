using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler(
    IUserRepository userRepository,
    IPasswordResetTokenRepository passwordResetTokenRepository,
    ISecureTokenService secureTokenService,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<ForgotPasswordCommandHandler> logger) : ICommandHandler<ForgotPasswordCommand>
{
    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var email = Email.Create(normalizedEmail);

        var user = await userRepository.FindByEmailAsync(email, cancellationToken);
        if (user is null)
        {
            logger.LogInformation("Password reset requested for non-existent email '{Email}'.", normalizedEmail);
            return Result.Success();
        }

        var existingToken = await passwordResetTokenRepository.FindActiveByUserIdAsync(user.Id, cancellationToken);
        if (existingToken is not null)
        {
            if (clock.UtcNow - existingToken.CreatedAt < AuthPolicy.VerificationResendCooldown)
            {
                logger.LogInformation(
                    "Password reset requested too soon for user '{UserId}'. 2-minute cooldown in effect.",
                    user.Id);
                return Result.Success(); // Silent success to prevent enumeration
            }

            existingToken.Revoke(clock);
            await passwordResetTokenRepository.UpdateAsync(existingToken, cancellationToken);
        }

        // Generate cryptographically secure token and its SHA-256 hash
        var plainToken = secureTokenService.GenerateToken();
        var tokenHash = secureTokenService.HashToken(plainToken);

        var resetToken = PasswordResetToken.Create(
            user.Id,
            tokenHash,
            plainToken,
            user.Email.Value,
            user.Username.Value,
            clock);

        await passwordResetTokenRepository.AddAsync(resetToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Issued password reset token for user '{UserId}'.", user.Id);
        return Result.Success();
    }
}
