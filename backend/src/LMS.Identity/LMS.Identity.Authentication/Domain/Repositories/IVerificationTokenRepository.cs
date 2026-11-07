using LMS.Identity.Authentication.Domain.Entities;

namespace LMS.Identity.Authentication.Domain.Repositories;

public interface IVerificationTokenRepository
{
    Task<VerificationToken?> FindByTokenHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    Task<VerificationToken?> FindActiveByUserIdAsync(
        Guid userId,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);

    Task<List<VerificationToken>> GetActiveTokensByUserIdAsync(
        Guid userId,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        VerificationToken token,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        VerificationToken token,
        CancellationToken cancellationToken = default);
}
