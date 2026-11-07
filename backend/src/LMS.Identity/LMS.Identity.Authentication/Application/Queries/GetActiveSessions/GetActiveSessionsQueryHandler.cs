using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Queries.GetActiveSessions;

public sealed class GetActiveSessionsQueryHandler(
    ISessionRepository sessionRepository,
    ICurrentUser currentUser,
    ILogger<GetActiveSessionsQueryHandler> logger) : IQueryHandler<GetActiveSessionsQuery, IReadOnlyList<ActiveSessionResponse>>
{
    public async Task<Result<IReadOnlyList<ActiveSessionResponse>>> Handle(
        GetActiveSessionsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        var currentSessionId = currentUser.SessionId;

        if (!userId.HasValue)
        {
            logger.LogWarning("GetActiveSessions requested without authenticated user context.");
            return Result.Failure<IReadOnlyList<ActiveSessionResponse>>(
                Error.Unauthorized("Authentication is required to view active sessions."));
        }

        var sessions = await sessionRepository.FindActiveByUserIdAsync(userId.Value, cancellationToken);

        var response = sessions.Select(s => new ActiveSessionResponse(
            s.Id,
            s.DeviceType.ToString().ToUpperInvariant(),
            s.Browser,
            s.OperatingSystem,
            s.IpAddress,
            s.LastActivityAt,
            s.ExpiresAt,
            currentSessionId.HasValue && s.Id == currentSessionId.Value
        )).ToList();

        logger.LogInformation("Retrieved {Count} active session(s) for user '{UserId}'.", response.Count, userId.Value);
        return Result.Success<IReadOnlyList<ActiveSessionResponse>>(response);
    }
}
