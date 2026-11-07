using LMS.Shared.Domain.Events;

namespace LMS.Identity.Authentication.Domain.Events;

public sealed record PasswordResetTokenCreatedDomainEvent(
    Guid UserId,
    string Email,
    string Username,
    string ResetToken,
    DateTimeOffset OccurredAt) : DomainEvent(OccurredAt);
