using System.ComponentModel.DataAnnotations;

namespace LMS.Identity.Authentication.Infrastructure.Options;

public sealed class GoogleAuthOptions
{
    public const string SectionName = "Authentication:Google";

    [Required(ErrorMessage = "Google ClientId is required.")]
    public string ClientId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Google ClientSecret is required.")]
    public string ClientSecret { get; set; } = string.Empty;

    public string CallbackPath { get; set; } = "/api/auth/google/callback";

    public string SuccessRedirect { get; set; } = "http://localhost:3000/auth/google";
}
