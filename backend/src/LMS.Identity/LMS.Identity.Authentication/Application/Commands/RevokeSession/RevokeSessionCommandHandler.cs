using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.RevokeSession;

public sealed class RevokeSessionCommandHandler(
    ISessionRepository sessionRepository,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<RevokeSessionCommandHandler> logger) : ICommandHandler<RevokeSessionCommand, RevokeSessionResult>
{
    public async Task<Result<RevokeSessionResult>> Handle(
        RevokeSessionCommand request,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUser.UserId;
        if (!currentUserId.HasValue)
        {
            return Result.Failure<RevokeSessionResult>(Error.Unauthorized("User is missing from token."));
        }

        var session = await sessionRepository.FindByIdWithRefreshTokenAsync(request.SessionId, cancellationToken);
        if (session is null)
        {
            return Result.Failure<RevokeSessionResult>(Error.NotFound("Session", request.SessionId));
        }

        if (session.UserId != currentUserId.Value)
        {
            logger.LogWarning(
                "IDOR security violation: User '{CurrentUserId}' attempted to revoke Session '{TargetSessionId}' belonging to User '{OwnerId}'.",
                currentUserId.Value,
                session.Id,
                session.UserId);

            return Result.Failure<RevokeSessionResult>(Error.Forbidden("You do not have permission to revoke this session."));
        }

        session.Revoke(clock);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var wasCurrentSession = currentUser.SessionId.HasValue && currentUser.SessionId.Value == session.Id;
        logger.LogInformation(
            "Session '{SessionId}' revoked by User '{UserId}'. (WasCurrent: {WasCurrent})",
            session.Id,
            currentUserId.Value,
            wasCurrentSession);

        return Result.Success(new RevokeSessionResult(wasCurrentSession));
    }
}
