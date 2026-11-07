namespace LMS.Shared.Application.Abstractions.Email;

/// <summary>
/// Represents an email message to be sent via the generic IEmailSender.
/// </summary>
/// <param name="To">Recipient email address.</param>
/// <param name="Subject">Email subject line.</param>
/// <param name="HtmlBody">Rendered HTML content.</param>
/// <param name="PlainTextBody">Optional plain-text fallback content.</param>
public sealed record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? PlainTextBody = null);
