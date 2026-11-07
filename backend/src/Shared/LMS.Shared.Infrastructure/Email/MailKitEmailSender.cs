using LMS.Shared.Application.Abstractions.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace LMS.Shared.Infrastructure.Email;

public sealed class MailKitEmailSender(
    IOptions<SmtpOptions> options,
    ILogger<MailKitEmailSender> logger) : IEmailSender
{
    private readonly SmtpOptions _options = options.Value;

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        mimeMessage.To.Add(MailboxAddress.Parse(message.To));
        mimeMessage.Subject = message.Subject;

        var builder = new BodyBuilder
        {
            HtmlBody = message.HtmlBody
        };

        if (!string.IsNullOrWhiteSpace(message.PlainTextBody))
        {
            builder.TextBody = message.PlainTextBody;
        }

        mimeMessage.Body = builder.ToMessageBody();

        using var client = new SmtpClient();

        try
        {
            logger.LogInformation("Connecting to SMTP server at {Host}:{Port} (SSL={UseSsl})...",
                _options.Host, _options.Port, _options.UseSsl);

            var socketOptions = _options.UseSsl
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.None;

            await client.ConnectAsync(_options.Host, _options.Port, socketOptions, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_options.Username))
            {
                await client.AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
            }

            logger.LogInformation("Sending email to {To} with subject '{Subject}'...", message.To, message.Subject);
            await client.SendAsync(mimeMessage, cancellationToken);
            logger.LogInformation("Email successfully dispatched to {To}.", message.To);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {To} via SMTP at {Host}:{Port}.",
                message.To, _options.Host, _options.Port);
            throw;
        }
        finally
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true, cancellationToken);
            }
        }
    }
}
