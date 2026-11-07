using LMS.Identity.Authentication.Domain.Entities;

namespace LMS.Identity.Authentication.Domain.Repositories;

public interface ISessionRepository
{
    Task<Session?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Session?> FindByIdWithRefreshTokenAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Session?> FindByRefreshTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task<Session?> FindActiveByUserAndDeviceAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Session>> FindActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task AddAsync(Session session, CancellationToken cancellationToken = default);

    Task UpdateAsync(Session session, CancellationToken cancellationToken = default);
}
