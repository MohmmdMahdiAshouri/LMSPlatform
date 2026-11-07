using LMS.Identity.Authentication.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Identity.Authentication.Infrastructure.Persistence.Configurations;

public sealed class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("sessions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(s => s.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => new { s.UserId, s.Status });
        
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.HasIndex(s => s.Status);

        builder.Property(s => s.DeviceType)
            .HasColumnName("device_type")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(s => s.Browser)
            .HasColumnName("browser")
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(s => s.OperatingSystem)
            .HasColumnName("operating_system")
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(s => s.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45) // IPv6 max length
            .IsRequired(false);

        builder.Property(s => s.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(s => s.LastActivityAt)
            .HasColumnName("last_activity_at")
            .IsRequired();

        builder.Property(s => s.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(s => s.RevokedAt)
            .HasColumnName("revoked_at")
            .IsRequired(false);

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // One Session owns exactly one RefreshToken
        builder.HasOne(s => s.RefreshToken)
            .WithOne()
            .HasForeignKey<RefreshToken>(rt => rt.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events so EF Core does not attempt to map them
        builder.Ignore(s => s.DomainEvents);
    }
}
