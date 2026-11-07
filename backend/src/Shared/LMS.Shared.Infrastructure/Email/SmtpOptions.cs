namespace LMS.Shared.Infrastructure.Email;

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1026;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = "no-reply@lms.local";
    public string FromName { get; set; } = "LMS Platform";
    public bool UseSsl { get; set; } = false;
}
