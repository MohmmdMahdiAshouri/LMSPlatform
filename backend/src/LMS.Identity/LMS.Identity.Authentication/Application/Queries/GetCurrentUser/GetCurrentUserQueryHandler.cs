using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Application.Abstractions.Security;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using Microsoft.Extensions.Logging;

namespace LMS.Identity.Authentication.Application.Queries.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(
    IUserRepository userRepository,
    ICurrentUser currentUser,
    ILogger<GetCurrentUserQueryHandler> logger) : IQueryHandler<GetCurrentUserQuery, CurrentUserResponse>
{
    public async Task<Result<CurrentUserResponse>> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
        {
            logger.LogWarning("GetCurrentUser requested without authenticated user context.");
            return Result.Failure<CurrentUserResponse>(
                Error.Unauthorized("Authentication is required."));
        }

        var user = await userRepository.FindByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            logger.LogError("Authenticated user '{UserId}' was not found in the database.", userId.Value);
            return Result.Failure<CurrentUserResponse>(
                Error.NotFound("User", userId.Value.ToString()));
        }

        var response = new CurrentUserResponse(
            user.Id,
            user.Email.Value,
            user.Username.Value,
            user.Status.ToString().ToUpperInvariant(),
            user.IsEmailVerified(),
            user.AvatarUrl,
            user.LastLoginAt,
            user.CreatedAt);

        return Result.Success(response);
    }
}
