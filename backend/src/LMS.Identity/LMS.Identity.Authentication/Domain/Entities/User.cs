using LMS.Identity.Authentication.Domain.Constants;
using LMS.Identity.Authentication.Domain.Enums;
using LMS.Identity.Authentication.Domain.Events;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Domain.Entities;

public sealed class User : AggregateRoot<Guid>
{
    private User() { }

    public Email Email { get; private set; } = null!;
    public Username Username { get; private set; } = null!;
    public PasswordHash? PasswordHash { get; private set; }
    public UserStatus Status { get; private set; } = UserStatus.Active;
    public DateTimeOffset? EmailVerifiedAt { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTimeOffset? LockedUntil { get; private set; }
    public string? GoogleId { get; private set; }
    public string? AvatarUrl { get; private set; }
    public DateTimeOffset? LastLoginAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    // ---------------------- Factories ----------------------

    public static User Register(
        Email email,
        Username username,
        PasswordHash passwordHash,
        ISystemClock clock)
    {
        var now = clock.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Username = username,
            PasswordHash = passwordHash,
            Status = UserStatus.Active,
            FailedLoginAttempts = 0,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.Raise(new UserRegisteredDomainEvent(
            user.Id,
            email.Value,
            username.Value,
            now));

        return user;
    }

    public static User RegisterWithGoogle(
        Email email,
        Username username,
        string googleId,
        string? avatarUrl,
        ISystemClock clock)
    {
        if (string.IsNullOrWhiteSpace(googleId))
            throw new ArgumentException("Google ID cannot be empty.", nameof(googleId));

        var now = clock.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Username = username,
            GoogleId = googleId,
            AvatarUrl = avatarUrl,
            EmailVerifiedAt = now, // Accounts authenticated via Google are pre-verified
            Status = UserStatus.Active,
            FailedLoginAttempts = 0,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.Raise(new UserRegisteredDomainEvent(
            user.Id,
            email.Value,
            username.Value,
            now));

        return user;
    }

    // ---------------------- Behaviours ----------------------

    public void VerifyEmail(ISystemClock clock)
    {
        if (EmailVerifiedAt is not null) return; // Idempotent
        EmailVerifiedAt = clock.UtcNow;
        Touch(clock);
    }

    public void RecordFailedLogin(ISystemClock clock)
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= AuthPolicy.MaxFailedLoginAttempts)
        {
            LockedUntil = clock.UtcNow.Add(AuthPolicy.LockDuration);
        }
        Touch(clock);
    }

    public void ResetFailedLogins(ISystemClock clock)
    {
        if (FailedLoginAttempts == 0 && LockedUntil is null) return;
        FailedLoginAttempts = 0;
        LockedUntil = null;
        Touch(clock);
    }

    public void Lock(TimeSpan duration, ISystemClock clock)
    {
        LockedUntil = clock.UtcNow.Add(duration);
        Touch(clock);
    }

    public void Unlock(ISystemClock clock)
    {
        LockedUntil = null;
        FailedLoginAttempts = 0;
        Touch(clock);
    }

    public void ChangePassword(PasswordHash newPasswordHash, ISystemClock clock)
    {
        PasswordHash = newPasswordHash;
        Touch(clock);
    }

    public void RecordSuccessfulLogin(ISystemClock clock)
    {
        FailedLoginAttempts = 0;
        LockedUntil = null;
        LastLoginAt = clock.UtcNow;
        Touch(clock);
    }

    public void LinkGoogleAccount(string googleId, ISystemClock clock)
    {
        if (string.IsNullOrWhiteSpace(googleId))
            throw new ArgumentException("Google ID cannot be empty.", nameof(googleId));

        GoogleId = googleId;
        Touch(clock);
    }

    // ---------------------- Invariants ----------------------

    public bool IsLocked(ISystemClock clock)
        => LockedUntil is not null && LockedUntil > clock.UtcNow;

    public bool IsEmailVerified() => EmailVerifiedAt is not null;

    public bool IsActive() => Status == UserStatus.Active;

    public bool HasPassword() => PasswordHash is not null;

    // ---------------------- Helpers ----------------------

    private void Touch(ISystemClock clock) => UpdatedAt = clock.UtcNow;
}

