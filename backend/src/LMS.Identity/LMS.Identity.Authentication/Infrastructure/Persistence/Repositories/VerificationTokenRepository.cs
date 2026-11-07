using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Repositories;

public sealed class VerificationTokenRepository(AuthenticationDbContext dbContext) : IVerificationTokenRepository
{

    public Task<VerificationToken?> FindByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default)
    {
        return dbContext.VerificationTokens
            .FirstOrDefaultAsync(vt => vt.TokenHash == tokenHash, cancellationToken);
    }

    public Task<VerificationToken?> FindActiveByUserIdAsync(
        Guid userId,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        return dbContext.VerificationTokens
            .Where(vt => vt.UserId == userId && vt.UsedAt == null && vt.RevokedAt == null && vt.ExpiresAt > now)
            .OrderByDescending(vt => vt.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<List<VerificationToken>> GetActiveTokensByUserIdAsync(
        Guid userId,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        return dbContext.VerificationTokens
            .Where(vt => vt.UserId == userId && vt.UsedAt == null && vt.RevokedAt == null && vt.ExpiresAt > now)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        VerificationToken token,
        CancellationToken cancellationToken = default)
    {
        await dbContext.VerificationTokens.AddAsync(token, cancellationToken);
    }

    public Task UpdateAsync(
        VerificationToken token,
        CancellationToken cancellationToken = default)
    {
        dbContext.VerificationTokens.Update(token);
        return Task.CompletedTask;
    }
}
