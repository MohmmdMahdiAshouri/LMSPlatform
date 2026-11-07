using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Repositories;

public sealed class UserRepository(AuthenticationDbContext dbContext) : IUserRepository
{
    public Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public Task<User?> FindByEmailAsync(Email email, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public Task<User?> FindByUsernameAsync(Username username, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId, cancellationToken);
    }

    public Task<bool> EmailExistsAsync(Email email, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public Task<bool> UsernameExistsAsync(Username username, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.AnyAsync(u => u.Username == username, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        dbContext.Users.Update(user);
        return Task.CompletedTask;
    }
}
