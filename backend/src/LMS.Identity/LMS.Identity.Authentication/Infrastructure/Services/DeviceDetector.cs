using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Enums;

namespace LMS.Identity.Authentication.Infrastructure.Services;

public sealed class DeviceDetector : IDeviceDetector
{
    public DeviceDetails Detect(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return new DeviceDetails(DeviceType.Unknown, null, null);
        }

        var os = DetectOperatingSystem(userAgent);
        var browser = DetectBrowser(userAgent);
        var deviceType = DetectDeviceType(userAgent, os);

        return new DeviceDetails(deviceType, browser, os);
    }

    private static string? DetectOperatingSystem(string ua)
    {
        if (ua.Contains("Windows NT 10.0", StringComparison.OrdinalIgnoreCase)) return "Windows 10/11";
        if (ua.Contains("Windows", StringComparison.OrdinalIgnoreCase)) return "Windows";
        if (ua.Contains("Android", StringComparison.OrdinalIgnoreCase)) return "Android";
        if (ua.Contains("iPhone", StringComparison.OrdinalIgnoreCase)) return "iOS (iPhone)";
        if (ua.Contains("iPad", StringComparison.OrdinalIgnoreCase)) return "iPadOS";
        if (ua.Contains("Macintosh", StringComparison.OrdinalIgnoreCase) || ua.Contains("Mac OS X", StringComparison.OrdinalIgnoreCase)) return "macOS";
        if (ua.Contains("Linux", StringComparison.OrdinalIgnoreCase)) return "Linux";
        return null;
    }

    private static string? DetectBrowser(string ua)
    {
        if (ua.Contains("Edg/", StringComparison.OrdinalIgnoreCase)) return "Microsoft Edge";
        if (ua.Contains("OPR/", StringComparison.OrdinalIgnoreCase) || ua.Contains("Opera", StringComparison.OrdinalIgnoreCase)) return "Opera";
        if (ua.Contains("Chrome/", StringComparison.OrdinalIgnoreCase)) return "Chrome";
        if (ua.Contains("Firefox/", StringComparison.OrdinalIgnoreCase)) return "Firefox";
        if (ua.Contains("Safari/", StringComparison.OrdinalIgnoreCase) && !ua.Contains("Chrome/", StringComparison.OrdinalIgnoreCase)) return "Safari";
        return null;
    }

    private static DeviceType DetectDeviceType(string ua, string? os)
    {
        if (ua.Contains("iPad", StringComparison.OrdinalIgnoreCase) || ua.Contains("Tablet", StringComparison.OrdinalIgnoreCase))
            return DeviceType.Tablet;

        if (ua.Contains("Mobile", StringComparison.OrdinalIgnoreCase) || ua.Contains("iPhone", StringComparison.OrdinalIgnoreCase) || (os == "Android" && ua.Contains("Mobile", StringComparison.OrdinalIgnoreCase)))
            return DeviceType.Mobile;

        if (os is "Windows" or "Windows 10/11" or "macOS" or "Linux")
            return DeviceType.Desktop;

        return DeviceType.Unknown;
    }
}
