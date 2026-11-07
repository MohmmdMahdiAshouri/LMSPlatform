namespace LMS.Shared.Application.Abstractions.Email;

/// <summary>
/// Defines the generic email transmission port.
/// Business modules invoke this port without depending on specific protocols (SMTP, SendGrid, Amazon SES, etc.).
/// </summary>
public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
