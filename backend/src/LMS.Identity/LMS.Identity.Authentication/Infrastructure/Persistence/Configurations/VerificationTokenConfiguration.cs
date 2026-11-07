using LMS.Identity.Authentication.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Configurations;

public sealed class VerificationTokenConfiguration : IEntityTypeConfiguration<VerificationToken>
{
    public void Configure(EntityTypeBuilder<VerificationToken> builder)
    {
        builder.ToTable("verification_tokens");

        builder.HasKey(vt => vt.Id);

        builder.Property(vt => vt.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(vt => vt.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(vt => vt.UserId);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(vt => vt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(vt => vt.TokenHash)
            .HasColumnName("token_hash")
            .HasMaxLength(255)
            .IsRequired();

        // Enforce uniqueness of token hashes across the table
        builder.HasIndex(vt => vt.TokenHash)
            .IsUnique();

        builder.Property(vt => vt.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.HasIndex(vt => vt.ExpiresAt);

        builder.Property(vt => vt.UsedAt)
            .HasColumnName("used_at")
            .IsRequired(false);

        builder.Property(vt => vt.RevokedAt)
            .HasColumnName("revoked_at")
            .IsRequired(false);

        builder.Property(vt => vt.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Ignore domain events so EF Core does not attempt to map them to columns
        builder.Ignore(vt => vt.DomainEvents);
    }
}
