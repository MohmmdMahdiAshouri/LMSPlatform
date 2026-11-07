using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.Identity.Authentication.WebApi.Dtos;

public sealed record ForgotPasswordRequest
{
    [JsonPropertyName("email"), Required, EmailAddress]
    public string Email { get; init; } = string.Empty;
}

public sealed record ResetPasswordRequest
{
    [JsonPropertyName("token"), Required]
    public string Token { get; init; } = string.Empty;

    [JsonPropertyName("password"), Required]
    public string Password { get; init; } = string.Empty;
}

public sealed record ChangePasswordRequest
{
    [JsonPropertyName("currentPassword"), Required]
    public string CurrentPassword { get; init; } = string.Empty;

    [JsonPropertyName("newPassword"), Required]
    public string NewPassword { get; init; } = string.Empty;
}
