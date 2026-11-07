using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Commands.Logout;

public sealed class LogoutCommandHandler(
    ISessionRepository sessionRepository,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork,
    ISystemClock clock,
    ILogger<LogoutCommandHandler> logger) : ICommandHandler<LogoutCommand>
{
    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var sessionId = currentUser.SessionId;
        if (!sessionId.HasValue)
        {
            logger.LogWarning("Logout attempted without a valid SessionId claim.");
            return Result.Failure(Error.Unauthorized("Session is missing from token."));
        }

        var session = await sessionRepository.FindByIdAsync(sessionId.Value, cancellationToken);
        if (session is not null)
        {
            session.Revoke(clock);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Session '{SessionId}' revoked successfully on logout.", sessionId.Value);
        }
        else
        {
            logger.LogInformation("Session '{SessionId}' was not found or already closed on logout.", sessionId.Value);
        }

        return Result.Success();
    }
}
