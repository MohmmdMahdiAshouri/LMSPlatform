namespace LMS.Shared.Common.Correlation;

/// <summary>
/// Well-known constants for correlation ID handling across middleware / Serilog / HttpClient.
/// </summary>
public static class CorrelationConstants
{
    public const string HeaderName = "X-Correlation-ID";

    public const string ContextItemKey = "LMS:CorrelationId";

    public const string SerilogPropertyName = "CorrelationId";
}
