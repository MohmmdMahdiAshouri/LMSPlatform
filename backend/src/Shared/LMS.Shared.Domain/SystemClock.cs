using LMS.Shared.Domain.Abstractions;

namespace LMS.Shared.Domain;

/// <summary>
/// Production implementation of <see cref="ISystemClock"/> returning current system UTC time.
/// </summary>
public sealed class SystemClock : ISystemClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
