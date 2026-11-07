using LMS.Shared.Domain.Abstractions;

namespace LMS.Shared.Domain.Entities;

public sealed class OutboxMessage : IEntity
{
    private OutboxMessage() { }

    public Guid Id { get; init; }
    public string EventType { get; init; } = string.Empty;
    public string Payload { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastError { get; set; }

    public static OutboxMessage Create(string eventType, string payload, DateTimeOffset occurredAt)
    {
        return new OutboxMessage
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            Payload = payload,
            CreatedAt = occurredAt,
            Attempts = 0
        };
    }

    public void MarkAsProcessed(DateTimeOffset processedAt)
    {
        ProcessedAt = processedAt;
        LastError = null;
    }

    public void RecordFailure(string error)
    {
        Attempts++;
        LastError = error;
    }
}
