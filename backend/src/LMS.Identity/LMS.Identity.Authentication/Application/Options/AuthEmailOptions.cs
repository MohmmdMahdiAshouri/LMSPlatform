namespace LMS.Identity.Authentication.Application.Options;

public sealed class AuthEmailOptions
{
    public const string SectionName = "Authentication";

    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";
}
