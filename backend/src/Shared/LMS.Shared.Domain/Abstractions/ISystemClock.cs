namespace LMS.Shared.Domain.Abstractions;

/// <summary>
/// Abstract clock so domain/application code never calls <see cref="DateTime.UtcNow"/> directly.
/// Tests inject <c>FakeClock</c>; production wires <c>SystemClock</c>.
/// Mirrors the NestJS Clock port in the original implementation.
/// </summary>
public interface ISystemClock
{
    DateTimeOffset UtcNow { get; }
}
