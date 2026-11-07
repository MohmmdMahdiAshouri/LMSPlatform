using LMS.Identity.Authentication.Domain.Constants;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Domain.Entities;

/// <summary>
/// Represents a long-lived credential used to obtain new Access Tokens
/// while the associated Session remains active.
/// Belongs to the Session Aggregate.
/// </summary>
public sealed class RefreshToken : Entity
{
    private RefreshToken() { } // Required by EF Core

    public Guid SessionId { get; private set; }
    public string TokenHash { get; private set; } = null!;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    // ---------------------- Factory ----------------------

    public static RefreshToken Create(
        Guid sessionId,
        string tokenHash,
        ISystemClock clock)
    {
        if (string.IsNullOrWhiteSpace(tokenHash))
            throw new ArgumentException("Token hash cannot be empty.", nameof(tokenHash));

        var now = clock.UtcNow;

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            TokenHash = tokenHash,
            ExpiresAt = now.Add(AuthPolicy.RefreshTokenLifetime),
            CreatedAt = now
        };
    }

    // ---------------------- Behaviours ----------------------

    /// <summary>
    /// Revokes this refresh token.
    /// </summary>
    public void Revoke(ISystemClock clock)
    {
        if (RevokedAt is not null) return; // Idempotent

        RevokedAt = clock.UtcNow;
    }

    /// <summary>
    /// Rotates this refresh token by replacing its hash in-place.
    /// This is the rotation strategy: same row, new hash — the old hash becomes immediately unusable.
    /// </summary>
    public void Rotate(string newTokenHash, ISystemClock clock)
    {
        if (string.IsNullOrWhiteSpace(newTokenHash))
            throw new ArgumentException("Token hash cannot be empty.", nameof(newTokenHash));

        TokenHash = newTokenHash;
        ExpiresAt = clock.UtcNow.Add(AuthPolicy.RefreshTokenLifetime);
    }

    // ---------------------- Invariants ----------------------

    public bool IsExpired(ISystemClock clock)
        => ExpiresAt <= clock.UtcNow;

    public bool IsRevoked()
        => RevokedAt is not null;

    /// <summary>
    /// A refresh token is valid when it is not expired and not revoked.
    /// </summary>
    public bool IsValid(ISystemClock clock)
        => !IsExpired(clock) && !IsRevoked();
}
