using System.Text.Json.Serialization;

namespace LMS.Identity.Authentication.Application.Queries.GetCurrentUser;

public sealed record CurrentUserResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("username")] string Username,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("emailVerified")] bool EmailVerified,
    [property: JsonPropertyName("avatarUrl")] string? AvatarUrl,
    [property: JsonPropertyName("lastLoginAt")] DateTimeOffset? LastLoginAt,
    [property: JsonPropertyName("createdAt")] DateTimeOffset CreatedAt);
