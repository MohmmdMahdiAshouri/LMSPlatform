using System.Net;

namespace LMS.Identity.Authentication.Application.Services;

public static class EmailTemplateBuilder
{
    public static string BuildVerificationEmail(string username, string verifyUrl, string token)
    {
        var safeUsername = WebUtility.HtmlEncode(username);
        var safeUrl = WebUtility.HtmlEncode(verifyUrl);
        var safeToken = WebUtility.HtmlEncode(token);

        return $@"
<!DOCTYPE html>
<html dir=""rtl"" lang=""fa"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>تایید آدرس ایمیل - LMS Platform</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            color: #1f2937;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            direction: rtl;
        }}
        .header {{
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }}
        .content {{
            padding: 30px;
            line-height: 1.7;
        }}
        .content p {{
            margin-bottom: 16px;
            font-size: 15px;
        }}
        .button-wrapper {{
            text-align: center;
            margin: 30px 0;
        }}
        .btn {{
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            transition: background-color 0.2s;
        }}
        .btn:hover {{
            background-color: #4338ca;
        }}
        .token-box {{
            background-color: #f3f4f6;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 14px;
            text-align: center;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
            margin: 20px 0;
            direction: ltr;
        }}
        .footer {{
            background-color: #f9fafb;
            padding: 20px 30px;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}
        .footer a {{
            color: #4f46e5;
            text-decoration: none;
        }}
        .note {{
            font-size: 13px;
            color: #dc2626;
            margin-top: 15px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>سامانه مدیریت یادگیری (LMS)</h1>
        </div>
        <div class=""content"">
            <p>سلام <strong>{safeUsername}</strong> عزیز،</p>
            <p>از اینکه در سامانه LMS ثبت‌نام کردید بسیار خوشحالیم! جهت فعال‌سازی کامل حساب کاربری و دسترسی به دوره‌ها، لطفاً آدرس ایمیل خود را تایید کنید.</p>
            
            <div class=""button-wrapper"">
                <a href=""{safeUrl}"" class=""btn"" target=""_blank"">تایید آدرس ایمیل</a>
            </div>

            <p>همچنین می‌توانید توکن زیر را مستقیماً در صفحه تایید ایمیل وارد نمایید:</p>
            <div class=""token-box"">
                {safeToken}
            </div>

            <p class=""note"">⚠️ این لینک و توکن به دلایل امنیتی فقط تا <strong>۱۵ دقیقه</strong> آینده معتبر است.</p>
            <p style=""font-size: 13px; color: #6b7280;"">اگر دکمه بالا برای شما کار نمی‌کند، لینک زیر را در مرورگر خود کپی کنید:<br>
            <span style=""direction: ltr; display: inline-block; word-break: break-all; color: #4f46e5;"">{safeUrl}</span></p>
        </div>
        <div class=""footer"">
            <p>اگر شما در سایت ما ثبت‌نام نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
            <p>&copy; {DateTime.UtcNow.Year} LMS Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string BuildPasswordResetEmail(string username, string resetUrl, string token)
    {
        var safeUsername = WebUtility.HtmlEncode(username);
        var safeUrl = WebUtility.HtmlEncode(resetUrl);
        var safeToken = WebUtility.HtmlEncode(token);

        return $@"
<!DOCTYPE html>
<html dir=""rtl"" lang=""fa"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>بازیابی رمز عبور - LMS Platform</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            color: #1f2937;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            direction: rtl;
        }}
        .header {{
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }}
        .content {{
            padding: 30px;
            line-height: 1.7;
        }}
        .content p {{
            margin-bottom: 16px;
            font-size: 15px;
        }}
        .button-wrapper {{
            text-align: center;
            margin: 30px 0;
        }}
        .btn {{
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            transition: background-color 0.2s;
        }}
        .btn:hover {{
            background-color: #4338ca;
        }}
        .token-box {{
            background-color: #f3f4f6;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 14px;
            text-align: center;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
            margin: 20px 0;
            direction: ltr;
        }}
        .footer {{
            background-color: #f9fafb;
            padding: 20px 30px;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}
        .note {{
            font-size: 13px;
            color: #dc2626;
            margin-top: 15px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>سامانه مدیریت یادگیری (LMS)</h1>
        </div>
        <div class=""content"">
            <p>سلام <strong>{safeUsername}</strong> عزیز،</p>
            <p>درخواستی برای بازنشانی رمز عبور حساب کاربری شما دریافت شده است. با کلیک روی دکمه زیر می‌توانید رمز عبور جدید خود را تعیین کنید:</p>
            
            <div class=""button-wrapper"">
                <a href=""{safeUrl}"" class=""btn"" target=""_blank"">بازنشانی رمز عبور</a>
            </div>

            <p>همچنین می‌توانید توکن زیر را مستقیماً در صفحه بازنشانی رمز عبور وارد نمایید:</p>
            <div class=""token-box"">
                {safeToken}
            </div>

            <p class=""note"">⚠️ این لینک و توکن به دلایل امنیتی فقط تا <strong>۱۵ دقیقه</strong> آینده معتبر است.</p>
            <p style=""font-size: 13px; color: #6b7280;"">اگر این درخواست از سوی شما ارسال نشده است، نیازی به انجام کاری نیست و رمز عبور شما بدون تغییر باقی خواهد ماند.<br>
            <span style=""direction: ltr; display: inline-block; word-break: break-all; color: #4f46e5;"">{safeUrl}</span></p>
        </div>
        <div class=""footer"">
            <p>&copy; {DateTime.UtcNow.Year} LMS Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}
