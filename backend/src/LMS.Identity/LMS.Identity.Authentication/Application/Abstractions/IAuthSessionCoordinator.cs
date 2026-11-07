using LMS.Identity.Authentication.Domain.Entities;

namespace LMS.Identity.Authentication.Application.Abstractions;

public interface IAuthSessionCoordinator
{
    Task<AuthTokensResult> IssueSessionAsync(
        User user,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}
