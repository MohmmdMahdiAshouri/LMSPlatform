using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.Identity.Authentication.WebApi.Dtos;

public sealed record RegisterRequest
{
    [JsonPropertyName("email"), Required]
    public string Email { get; init; } = string.Empty;

    [JsonPropertyName("username"), Required]
    public string Username { get; init; } = string.Empty;

    [JsonPropertyName("password"), Required]
    public string Password { get; init; } = string.Empty;
}

public sealed class LoginRequest
{
    private string _identifier = string.Empty;

    [JsonPropertyName("identifier")]
    public string Identifier
    {
        get => _identifier;
        set => _identifier = value;
    }

    [JsonPropertyName("emailOrUsername")]
    public string? EmailOrUsername
    {
        get => _identifier;
        set
        {
            if (!string.IsNullOrWhiteSpace(value))
                _identifier = value;
        }
    }

    [JsonPropertyName("password"), Required]
    public string Password { get; set; } = string.Empty;
}

public sealed record AuthResponse(
    [property: JsonPropertyName("accessToken")] string AccessToken);