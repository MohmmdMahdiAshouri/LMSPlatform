using MediatR;

namespace LMS.Shared.Domain.Events;

public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTimeOffset OccurredAt { get; }
    string EventType { get; }
}
