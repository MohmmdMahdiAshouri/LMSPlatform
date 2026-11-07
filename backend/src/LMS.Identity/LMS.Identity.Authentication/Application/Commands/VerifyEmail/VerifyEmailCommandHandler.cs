using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.VerifyEmail;

public sealed class VerifyEmailCommandHandler(
    IVerificationTokenRepository verificationTokenRepository,
    IUserRepository userRepository,
    ISecureTokenService secureTokenService,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<VerifyEmailCommandHandler> logger) : ICommandHandler<VerifyEmailCommand>
{
    public async Task<Result> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = secureTokenService.HashToken(request.VerificationToken);
        var verificationToken = await verificationTokenRepository.FindByTokenHashAsync(tokenHash, cancellationToken);

        if (verificationToken is null || !verificationToken.IsUsable(clock))
        {
            logger.LogWarning("Attempted email verification with an invalid, expired, or already used token.");
            return Result.Failure(Error.BusinessRule("Verification token is invalid, expired, or already used."));
        }

        var user = await userRepository.FindByIdAsync(verificationToken.UserId, cancellationToken);
        if (user is null)
        {
            logger.LogError("User '{UserId}' associated with verification token not found.", verificationToken.UserId);
            return Result.Failure(Error.NotFound("User", verificationToken.UserId.ToString()));
        }

        user.VerifyEmail(clock);
        verificationToken.Use(clock);

        await userRepository.UpdateAsync(user, cancellationToken);
        await verificationTokenRepository.UpdateAsync(verificationToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Successfully verified email for user '{UserId}'.", user.Id);
        return Result.Success();
    }
}
