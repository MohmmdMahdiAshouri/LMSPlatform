using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Enums;
using LMS.Identity.Authentication.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasConversion(
                email => email.Value,
                value => Email.Create(value))
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.Username)
            .HasColumnName("username")
            .HasConversion(
                username => username.Value,
                value => Username.Create(value))
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasConversion(
                hash => hash != null ? hash.Value : null,
                value => value != null ? PasswordHash.Create(value) : null)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(u => u.GoogleId)
            .HasColumnName("google_id")
            .HasMaxLength(255)
            .IsRequired(false);

        builder.HasIndex(u => u.GoogleId)
            .IsUnique()
            .HasFilter("[google_id] IS NOT NULL");

        builder.Property(u => u.AvatarUrl)
            .HasColumnName("avatar_url")
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(u => u.EmailVerifiedAt)
            .HasColumnName("email_verified_at")
            .IsRequired(false);

        builder.Property(u => u.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(u => u.FailedLoginAttempts)
            .HasColumnName("failed_login_attempts")
            .IsRequired();

        builder.Property(u => u.LockedUntil)
            .HasColumnName("locked_until")
            .IsRequired(false);

        builder.Property(u => u.LastLoginAt)
            .HasColumnName("last_login_at")
            .IsRequired(false);

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Ignore domain events so EF Core does not attempt to map them
        builder.Ignore(u => u.DomainEvents);
    }
}
