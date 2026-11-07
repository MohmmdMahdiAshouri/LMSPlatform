using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Events;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Domain.Entities;

public sealed class VerificationToken : Entity
{
    private VerificationToken() { } // Required by EF Core

    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = null!;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? UsedAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    // ---------------------- Factory ----------------------
    public static VerificationToken Create(
        Guid userId,
        string tokenHash,
        string plainToken,
        string email,
        string username,
        ISystemClock clock)
    {
        if (string.IsNullOrWhiteSpace(tokenHash))
            throw new ArgumentException("Token hash cannot be empty.", nameof(tokenHash));

        if (string.IsNullOrWhiteSpace(plainToken))
            throw new ArgumentException("Plain token cannot be empty.", nameof(plainToken));

        var now = clock.UtcNow;

        var token = new VerificationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = now.Add(AuthPolicy.VerificationTokenLifetime),
            CreatedAt = now
        };

        token.Raise(new VerificationTokenCreatedDomainEvent(
            userId,
            email,
            username,
            plainToken,
            now));

        return token;
    }

    // ---------------------- Behaviours ----------------------
    public void Use(ISystemClock clock)
    {
        if (!IsUsable(clock))
            throw new InvalidOperationException("Verification token is expired, revoked, or already used.");

        UsedAt = clock.UtcNow;
    }
    
    public void Revoke(ISystemClock clock)
    {
        if (RevokedAt is not null) return; // Idempotent

        RevokedAt = clock.UtcNow;
    }

    // ---------------------- Invariants ----------------------
    public bool IsExpired(ISystemClock clock)
        => ExpiresAt <= clock.UtcNow;

    public bool IsRevoked()
        => RevokedAt is not null;

    public bool IsUsed()
        => UsedAt is not null;

    public bool IsUsable(ISystemClock clock)
        => !IsExpired(clock) && !IsRevoked() && !IsUsed();
}
