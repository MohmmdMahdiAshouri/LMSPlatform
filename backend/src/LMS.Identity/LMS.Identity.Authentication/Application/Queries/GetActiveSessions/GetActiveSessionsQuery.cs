using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Queries.GetActiveSessions;

public sealed record GetActiveSessionsQuery : IQuery<IReadOnlyList<ActiveSessionResponse>>;
