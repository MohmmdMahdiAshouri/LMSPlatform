using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Enums;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Domain.Entities;

/// <summary>
/// Represents a single authenticated login session created after successful authentication.
/// Tracks a user's active device, manages session lifecycle, and owns the associated RefreshToken.
/// Aggregate Root of the Session Aggregate.
/// </summary>
public sealed class Session : AggregateRoot<Guid>
{
    private Session() { } // Required by EF Core

    public Guid UserId { get; private set; }
    public SessionStatus Status { get; private set; } = SessionStatus.Active;
    public DeviceType DeviceType { get; private set; } = DeviceType.Unknown;
    public string? Browser { get; private set; }
    public string? OperatingSystem { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public DateTimeOffset LastActivityAt { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    // Navigation — each Session owns exactly one active RefreshToken
    public RefreshToken? RefreshToken { get; private set; }

    // ---------------------- Factory ----------------------

    public static Session Create(
        Guid userId,
        DeviceType deviceType,
        string? browser,
        string? operatingSystem,
        string? ipAddress,
        string? userAgent,
        ISystemClock clock)
    {
        var now = clock.UtcNow;

        return new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = SessionStatus.Active,
            DeviceType = deviceType,
            Browser = browser,
            OperatingSystem = operatingSystem,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            LastActivityAt = now,
            ExpiresAt = now.Add(AuthPolicy.RefreshTokenLifetime),
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    // ---------------------- Behaviours ----------------------

    /// <summary>
    /// Attaches a new refresh token or rotates the existing one for this session.
    /// Aggregate Root controls the child RefreshToken entity lifecycle.
    /// </summary>
    public void SetRefreshToken(string tokenHash, ISystemClock clock)
    {
        if (RefreshToken is not null)
        {
            RefreshToken.Rotate(tokenHash, clock);
        }
        else
        {
            RefreshToken = RefreshToken.Create(Id, tokenHash, clock);
        }

        Touch(clock);
    }

    /// <summary>
    /// Revokes this session and its associated refresh token.
    /// </summary>
    public void Revoke(ISystemClock clock)
    {
        if (Status == SessionStatus.Revoked) return; // Idempotent

        Status = SessionStatus.Revoked;
        RevokedAt = clock.UtcNow;
        RefreshToken?.Revoke(clock);
        Touch(clock);
    }

    /// <summary>
    /// Marks this session as expired.
    /// </summary>
    public void Expire(ISystemClock clock)
    {
        if (Status == SessionStatus.Expired) return;

        Status = SessionStatus.Expired;
        Touch(clock);
    }

    /// <summary>
    /// Updates the last activity timestamp — called on every token refresh.
    /// </summary>
    public void RefreshActivity(ISystemClock clock)
    {
        LastActivityAt = clock.UtcNow;
        Touch(clock);
    }

    // ---------------------- Invariants ----------------------

    public bool IsActive(ISystemClock clock)
        => Status == SessionStatus.Active && !IsExpired(clock);

    public bool IsExpired(ISystemClock clock)
        => ExpiresAt <= clock.UtcNow;

    public bool IsRevoked()
        => Status == SessionStatus.Revoked;

    /// <summary>
    /// Determines whether a token refresh is allowed on this session.
    /// The session must be active and not expired.
    /// </summary>
    public bool CanRefresh(ISystemClock clock)
        => IsActive(clock);

    // ---------------------- Helpers ----------------------

    private void Touch(ISystemClock clock) => UpdatedAt = clock.UtcNow;
}
