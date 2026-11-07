using LMS.Shared.Domain.Events;

namespace LMS.Identity.Authentication.Domain.Events;

public sealed record VerificationTokenCreatedDomainEvent(
    Guid UserId,
    string Email,
    string Username,
    string VerificationToken,
    DateTimeOffset OccurredAt) : DomainEvent(OccurredAt);
