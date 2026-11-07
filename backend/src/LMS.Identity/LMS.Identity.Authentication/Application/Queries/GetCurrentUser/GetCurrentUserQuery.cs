using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Queries.GetCurrentUser;

public sealed record GetCurrentUserQuery : IQuery<CurrentUserResponse>;
