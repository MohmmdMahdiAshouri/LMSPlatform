using System.ComponentModel.DataAnnotations;

namespace LMS.Identity.Authentication.Infrastructure.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Authentication";

    [Required(ErrorMessage = "JwtAccessSecret is required.")]
    [MinLength(32, ErrorMessage = "JwtAccessSecret must be at least 32 characters for HMAC-SHA256.")]
    public string JwtAccessSecret { get; set; } = string.Empty;

    [Required(ErrorMessage = "JwtIssuer is required.")]
    public string JwtIssuer { get; set; } = "LMS";

    [Required(ErrorMessage = "JwtAudience is required.")]
    public string JwtAudience { get; set; } = "LMS";

    [Range(1, 1440, ErrorMessage = "AccessTokenMinutes must be between 1 and 1440.")]
    public int AccessTokenMinutes { get; set; } = 15;
}
