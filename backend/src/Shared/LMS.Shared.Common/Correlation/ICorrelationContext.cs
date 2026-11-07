namespace LMS.Shared.Common.Correlation;

/// <summary>
/// Per-request correlation ID accessor. Set by <see cref="CorrelationIdMiddleware"/> and consumed
/// by the global response envelope, Serilog enricher, and exception filter.
/// </summary>
public interface ICorrelationContext
{
    string CorrelationId { get; }
}

public sealed class CorrelationContext : ICorrelationContext
{
    public string CorrelationId { get; set; } = string.Empty;
}
