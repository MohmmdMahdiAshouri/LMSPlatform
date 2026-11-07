using System.ComponentModel.DataAnnotations;

namespace LMS.Identity.Authentication.Infrastructure.Options;

public sealed class PasswordHasherOptions
{
    public const string SectionName = "PasswordHasher";

    [Range(4, 31, ErrorMessage = "WorkFactor must be between 4 and 31.")]
    public int WorkFactor { get; set; } = 12;
}
