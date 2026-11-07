using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.ResendVerification;

public sealed class ResendVerificationCommandHandler(
    IUserRepository userRepository,
    IVerificationTokenRepository verificationTokenRepository,
    ICurrentUser currentUser,
    ISecureTokenService secureTokenService,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<ResendVerificationCommandHandler> logger) : ICommandHandler<ResendVerificationCommand>
{
    public async Task<Result> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
        {
            logger.LogWarning("ResendVerification attempted without authenticated user context.");
            return Result.Failure(Error.Unauthorized("Authentication is required to resend verification token."));
        }

        var user = await userRepository.FindByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            logger.LogError("Authenticated user '{UserId}' not found in database.", userId.Value);
            return Result.Failure(Error.NotFound("User", userId.Value.ToString()));
        }

        if (user.IsEmailVerified())
        {
            return Result.Failure(Error.BusinessRule("Email is already verified."));
        }

        // Check for active token and enforce the 2-minute cooldown
        var activeToken = await verificationTokenRepository.FindActiveByUserIdAsync(user.Id, clock.UtcNow, cancellationToken);
        if (activeToken is not null)
        {
            if (clock.UtcNow - activeToken.CreatedAt < AuthPolicy.VerificationResendCooldown)
            {
                logger.LogInformation(
                    "Verification token requested too soon for user '{UserId}'. 2-minute cooldown in effect.",
                    user.Id);
                return Result.Failure(Error.BusinessRule(
                    $"Verification token requested too soon. Please wait {AuthPolicy.VerificationResendCooldown.TotalMinutes:F0} minutes before requesting another."));
            }

            activeToken.Revoke(clock);
            await verificationTokenRepository.UpdateAsync(activeToken, cancellationToken);
        }

        // Generate cryptographically secure token and its SHA-256 hash
        var plainToken = secureTokenService.GenerateToken();
        var tokenHash = secureTokenService.HashToken(plainToken);

        var newToken = VerificationToken.Create(
            user.Id,
            tokenHash,
            plainToken,
            user.Email.Value,
            user.Username.Value,
            clock);

        await verificationTokenRepository.AddAsync(newToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Issued new verification token for user '{UserId}'.", user.Id);
        return Result.Success();
    }
}
