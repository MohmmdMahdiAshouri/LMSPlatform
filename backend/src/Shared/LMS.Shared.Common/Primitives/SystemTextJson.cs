using System.Text.Json;

namespace LMS.Shared.Common.Primitives;

/// <summary>
/// Helper to read/write JSON without ASP.NET Core dependencies.
/// Used by the Outbox serializer (which lives outside the web host).
/// </summary>
public static class SystemTextJson
{
    public static readonly JsonSerializerOptions DefaultOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, DefaultOptions);
    public static T? Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json, DefaultOptions);
}
