using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler(
    ISessionRepository sessionRepository,
    IUserRepository userRepository,
    ISecureTokenService secureTokenService,
    IAccessTokenGenerator accessTokenGenerator,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<RefreshTokenCommandHandler> logger) : ICommandHandler<RefreshTokenCommand, RefreshTokenResult>
{
    public async Task<Result<RefreshTokenResult>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RawRefreshToken))
        {
            return Result.Failure<RefreshTokenResult>(
                Error.Unauthorized(ErrorCode.Unauthorized, "Refresh token is required."));
        }

        // 1. Hash the raw incoming refresh token
        var tokenHash = secureTokenService.HashToken(request.RawRefreshToken);

        // 2. Query session aggregate by refresh token hash (eagerly loading child RefreshToken)
        var session = await sessionRepository.FindByRefreshTokenHashAsync(tokenHash, cancellationToken);
        if (session is null)
        {
            logger.LogWarning("Refresh token failed: No session found matching token hash.");
            return Result.Failure<RefreshTokenResult>(
                Error.Unauthorized(ErrorCode.Unauthorized, "Invalid or revoked refresh token."));
        }

        // 3. Evaluate invariants on Session and child RefreshToken
        if (session.RefreshToken is null || !session.RefreshToken.IsValid(clock) || !session.CanRefresh(clock))
        {
            logger.LogWarning(
                "Refresh token failed: Session '{SessionId}' cannot be refreshed (Active: {IsActive}, Expired: {IsExpired}).",
                session.Id,
                session.IsActive(clock),
                session.IsExpired(clock));

            return Result.Failure<RefreshTokenResult>(
                Error.Unauthorized(ErrorCode.Unauthorized, "Refresh token has expired or session is invalid."));
        }

        // 4. Verify associated User exists and account status is active
        var user = await userRepository.FindByIdAsync(session.UserId, cancellationToken);
        if (user is null || !user.IsActive() || user.IsLocked(clock))
        {
            logger.LogWarning(
                "Refresh token failed: User '{UserId}' not found, inactive, or locked.",
                session.UserId);

            return Result.Failure<RefreshTokenResult>(
                Error.Unauthorized(ErrorCode.Unauthorized, "User account is inactive or locked."));
        }

        // 5. Touch session activity timestamp (retaining static refresh token as per project specification)
        session.RefreshActivity(clock);
        await sessionRepository.UpdateAsync(session, cancellationToken);

        // 6. Generate fresh signed JWT Access Token
        var accessToken = accessTokenGenerator.GenerateToken(user, session);

        // 7. Persist changes atomically
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Access token refreshed successfully for Session '{SessionId}'.", session.Id);

        return Result.Success(new RefreshTokenResult(accessToken));
    }
}
