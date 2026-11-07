using LMS.Shared.Domain.Events;

namespace LMS.Identity.Authentication.Domain.Events;

public sealed record UserRegisteredDomainEvent(
    Guid UserId,
    string Email,
    string Username,
    DateTimeOffset OccurredAt) : DomainEvent(OccurredAt);
