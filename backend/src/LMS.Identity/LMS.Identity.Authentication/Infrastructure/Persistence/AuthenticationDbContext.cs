using LMS.Identity.Authentication.Domain.Entities;
using LMS.Shared.Domain.Abstractions;
using LMS.Shared.Domain.Entities;
using LMS.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LMS.Identity.Authentication.Infrastructure.Persistence;

public sealed class AuthenticationDbContext(DbContextOptions<AuthenticationDbContext> options)
    : DbContext(options), IUnitOfWork, IOutboxDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VerificationToken> VerificationTokens => Set<VerificationToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AuthenticationDbContext).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IOutboxDbContext).Assembly);
    }
}
