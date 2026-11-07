using LMS.Identity.Authentication.Application.Options;
using LMS.Identity.Authentication.Application.Services;
using LMS.Identity.Authentication.Domain.Events;
using LMS.Shared.Application.Abstractions.Email;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LMS.Identity.Authentication.Application.Events;

public sealed class SendVerificationEmailOnTokenCreatedHandler(
    IEmailSender emailSender,
    IOptions<AuthEmailOptions> emailOptions,
    ILogger<SendVerificationEmailOnTokenCreatedHandler> logger)
    : INotificationHandler<VerificationTokenCreatedDomainEvent>
{
    public async Task Handle(
        VerificationTokenCreatedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Processing verification email dispatch for user {UserId} ({Email})...",
            notification.UserId,
            notification.Email);

        var baseUrl = emailOptions.Value.FrontendBaseUrl.TrimEnd('/');
        var verifyUrl = $"{baseUrl}/auth/verify-email?token={Uri.EscapeDataString(notification.VerificationToken)}&userId={notification.UserId}";

        var htmlBody = EmailTemplateBuilder.BuildVerificationEmail(
            notification.Username,
            verifyUrl,
            notification.VerificationToken);

        var plainTextBody = $@"سلام {notification.Username} عزیز،
جهت فعال‌سازی حساب کاربری خود در سامانه LMS، لطفاً با کلیک روی لینک زیر ایمیل خود را تایید کنید:
{verifyUrl}

یا توکن زیر را مستقیماً وارد نمایید:
{notification.VerificationToken}

این توکن تا ۱۵ دقیقه آینده معتبر است.";

        var emailMessage = new EmailMessage(
            To: notification.Email,
            Subject: "تایید آدرس ایمیل - LMS Platform",
            HtmlBody: htmlBody,
            PlainTextBody: plainTextBody);

        await emailSender.SendAsync(emailMessage, cancellationToken);

        logger.LogInformation(
            "Verification email successfully queued to SMTP for user {UserId} ({Email}).",
            notification.UserId,
            notification.Email);
    }
}
