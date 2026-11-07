using LMS.Identity.Authentication.Application.Options;
using LMS.Identity.Authentication.Application.Services;
using LMS.Identity.Authentication.Domain.Events;
using LMS.Shared.Application.Abstractions.Email;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LMS.Identity.Authentication.Application.Events;

public sealed class SendPasswordResetEmailOnTokenCreatedHandler(
    IEmailSender emailSender,
    IOptions<AuthEmailOptions> emailOptions,
    ILogger<SendPasswordResetEmailOnTokenCreatedHandler> logger)
    : INotificationHandler<PasswordResetTokenCreatedDomainEvent>
{
    public async Task Handle(
        PasswordResetTokenCreatedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Processing password reset email dispatch for user {UserId} ({Email})...",
            notification.UserId,
            notification.Email);

        var baseUrl = emailOptions.Value.FrontendBaseUrl.TrimEnd('/');
        var resetUrl = $"{baseUrl}/auth/reset-password?password-reset-token={Uri.EscapeDataString(notification.ResetToken)}&token={Uri.EscapeDataString(notification.ResetToken)}";

        var htmlBody = EmailTemplateBuilder.BuildPasswordResetEmail(
            notification.Username,
            resetUrl,
            notification.ResetToken);

        var plainTextBody = $@"سلام {notification.Username} عزیز،
درخواستی برای بازنشانی رمز عبور حساب کاربری شما در سامانه LMS ثبت شده است.
جهت بازنشانی رمز عبور، لطفاً روی لینک زیر کلیک کنید:
{resetUrl}

یا توکن زیر را مستقیماً وارد نمایید:
{notification.ResetToken}

این لینک تا ۱۵ دقیقه معتبر است. اگر شما این درخواست را نداده‌اید، آن را نادیده بگیرید.";

        var emailMessage = new EmailMessage(
            To: notification.Email,
            Subject: "بازیابی رمز عبور - LMS Platform",
            HtmlBody: htmlBody,
            PlainTextBody: plainTextBody);

        await emailSender.SendAsync(emailMessage, cancellationToken);

        logger.LogInformation(
            "Password reset email successfully queued to SMTP for user {UserId} ({Email}).",
            notification.UserId,
            notification.Email);
    }
}
