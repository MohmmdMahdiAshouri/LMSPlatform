using LMS.Shared.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Shared.Infrastructure.Persistence.Configurations;

public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(m => m.EventType)
            .HasColumnName("event_type")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(m => m.Payload)
            .HasColumnName("payload")
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(m => m.ProcessedAt)
            .HasColumnName("processed_at")
            .IsRequired(false);

        builder.Property(m => m.Attempts)
            .HasColumnName("attempts")
            .IsRequired();

        builder.Property(m => m.LastError)
            .HasColumnName("last_error")
            .IsRequired(false);

        // Filtered index for high-performance polling of unhandled messages
        builder.HasIndex(m => new { m.ProcessedAt, m.CreatedAt })
            .HasFilter("[processed_at] IS NULL");
    }
}
