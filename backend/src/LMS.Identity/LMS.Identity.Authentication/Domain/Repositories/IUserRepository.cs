using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.ValueObjects;

namespace LMS.Identity.Authentication.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> FindByEmailAsync(Email email, CancellationToken cancellationToken = default);
    Task<User?> FindByUsernameAsync(Username username, CancellationToken cancellationToken = default);
    Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(Email email, CancellationToken cancellationToken = default);
    Task<bool> UsernameExistsAsync(Username username, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
}
