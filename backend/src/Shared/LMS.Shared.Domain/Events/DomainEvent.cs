namespace LMS.Shared.Domain.Events;

public abstract record DomainEvent(DateTimeOffset OccurredAt) : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public string EventType => GetType().Name;
}
