using System.Text.Json.Serialization;

namespace LMS.Identity.Authentication.Application.Queries.GetActiveSessions;

public sealed record ActiveSessionResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("deviceType")] string DeviceType,
    [property: JsonPropertyName("browser")] string? Browser,
    [property: JsonPropertyName("os")] string? OperatingSystem,
    [property: JsonPropertyName("ipAddress")] string? IpAddress,
    [property: JsonPropertyName("lastActivityAt")] DateTimeOffset LastActivityAt,
    [property: JsonPropertyName("expiresAt")] DateTimeOffset ExpiresAt,
    [property: JsonPropertyName("isCurrent")] bool IsCurrent);
