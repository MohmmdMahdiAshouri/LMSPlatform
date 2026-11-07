using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.Identity.Authentication.WebApi.Dtos;

public sealed record VerifyEmailRequest
{
    [JsonPropertyName("verificationToken"), Required]
    public string VerificationToken { get; init; } = string.Empty;
}
