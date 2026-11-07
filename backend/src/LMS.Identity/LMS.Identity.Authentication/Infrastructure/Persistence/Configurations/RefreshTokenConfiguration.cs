using LMS.Identity.Authentication.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(rt => rt.SessionId)
            .HasColumnName("session_id")
            .IsRequired();

        // One RefreshToken per Session — enforced at DB level
        builder.HasIndex(rt => rt.SessionId)
            .IsUnique();

        builder.Property(rt => rt.TokenHash)
            .HasColumnName("token_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(rt => rt.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.HasIndex(rt => rt.ExpiresAt);

        builder.Property(rt => rt.RevokedAt)
            .HasColumnName("revoked_at")
            .IsRequired(false);

        builder.Property(rt => rt.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Ignore domain events so EF Core does not attempt to map them
        builder.Ignore(rt => rt.DomainEvents);
    }
}
