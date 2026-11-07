using LMS.Identity.Authentication.Domain.Entities;

namespace LMS.Identity.Authentication.Domain.Repositories;

public interface IPasswordResetTokenRepository
{
    Task<PasswordResetToken?> FindByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task<PasswordResetToken?> FindActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);

    Task UpdateAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
}
