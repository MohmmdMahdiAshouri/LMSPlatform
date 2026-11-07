using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.LogoutAll;

public sealed class LogoutAllCommandHandler(
    ISessionRepository sessionRepository,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<LogoutAllCommandHandler> logger) : ICommandHandler<LogoutAllCommand>
{
    public async Task<Result> Handle(LogoutAllCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
        {
            logger.LogWarning("LogoutAll attempted without a valid UserId claim.");
            return Result.Failure(Error.Unauthorized("User is missing from token."));
        }

        var activeSessions = await sessionRepository.FindActiveByUserIdAsync(userId.Value, cancellationToken);
        foreach (var session in activeSessions)
        {
            session.Revoke(clock);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Revoked {Count} active session(s) for User '{UserId}'.", activeSessions.Count, userId.Value);

        return Result.Success();
    }
}
