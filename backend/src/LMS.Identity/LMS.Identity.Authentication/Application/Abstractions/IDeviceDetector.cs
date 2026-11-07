using LMS.Identity.Authentication.Domain.Enums;

namespace LMS.Identity.Authentication.Application.Abstractions;

public sealed record DeviceDetails(
    DeviceType DeviceType,
    string? Browser,
    string? OperatingSystem);


public interface IDeviceDetector
{
    DeviceDetails Detect(string? userAgent);
}
