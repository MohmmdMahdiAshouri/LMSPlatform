using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Enums;
using LMS.Identity.Authentication.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Repositories;

public sealed class SessionRepository : ISessionRepository
{
    private readonly AuthenticationDbContext _dbContext;

    public SessionRepository(AuthenticationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Session?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Sessions
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public Task<Session?> FindByIdWithRefreshTokenAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Sessions
            .Include(s => s.RefreshToken)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public Task<Session?> FindByRefreshTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return _dbContext.Sessions
            .Include(s => s.RefreshToken)
            .FirstOrDefaultAsync(s => s.RefreshToken != null && s.RefreshToken.TokenHash == tokenHash, cancellationToken);
    }

    public Task<Session?> FindActiveByUserAndDeviceAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Sessions
            .Include(s => s.RefreshToken)
            .FirstOrDefaultAsync(
                s => s.UserId == userId
                    && s.Status == SessionStatus.Active
                    && s.IpAddress == ipAddress
                    && s.UserAgent == userAgent,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Session>> FindActiveByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Sessions
            .Include(s => s.RefreshToken)
            .Where(s => s.UserId == userId && s.Status == SessionStatus.Active)
            .OrderByDescending(s => s.LastActivityAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Session session, CancellationToken cancellationToken = default)
    {
        await _dbContext.Sessions.AddAsync(session, cancellationToken);
    }

    public Task UpdateAsync(Session session, CancellationToken cancellationToken = default)
    {
        _dbContext.Sessions.Update(session);
        return Task.CompletedTask;
    }
}
