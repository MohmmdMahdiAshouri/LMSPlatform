using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Repositories;

public sealed class PasswordResetTokenRepository(AuthenticationDbContext dbContext) : IPasswordResetTokenRepository
{
    public Task<PasswordResetToken?> FindByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default)
    {
        return dbContext.PasswordResetTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);
    }

    public Task<PasswordResetToken?> FindActiveByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.PasswordResetTokens
            .Where(rt => rt.UserId == userId && rt.UsedAt == null && rt.RevokedAt == null)
            .OrderByDescending(rt => rt.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(
        PasswordResetToken token,
        CancellationToken cancellationToken = default)
    {
        await dbContext.PasswordResetTokens.AddAsync(token, cancellationToken);
    }

    public Task UpdateAsync(
        PasswordResetToken token,
        CancellationToken cancellationToken = default)
    {
        dbContext.PasswordResetTokens.Update(token);
        return Task.CompletedTask;
    }
}
