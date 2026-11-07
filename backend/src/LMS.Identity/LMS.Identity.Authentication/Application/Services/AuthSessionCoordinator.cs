using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Application.Services;

public sealed class AuthSessionCoordinator(
    ISessionRepository sessionRepository,
    ISecureTokenService secureTokenService,
    IDeviceDetector deviceDetector,
    IAccessTokenGenerator accessTokenGenerator,
    ISystemClock clock) : IAuthSessionCoordinator
{
    public async Task<AuthTokensResult> IssueSessionAsync(
        User user,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        var existingSession = await sessionRepository.FindActiveByUserAndDeviceAsync(
            user.Id,
            ipAddress,
            userAgent,
            cancellationToken);

        Session session;
        string rawRefreshToken;

        if (existingSession is not null && !existingSession.IsExpired(clock))
        {
            session = existingSession;
            session.RefreshActivity(clock);

            rawRefreshToken = secureTokenService.GenerateToken();
            var refreshTokenHash = secureTokenService.HashToken(rawRefreshToken);

            session.SetRefreshToken(refreshTokenHash, clock);

            await sessionRepository.UpdateAsync(session, cancellationToken);
        }
        else
        {
            var device = deviceDetector.Detect(userAgent);
            session = Session.Create(
                user.Id,
                device.DeviceType,
                device.Browser,
                device.OperatingSystem,
                ipAddress,
                userAgent,
                clock);

            rawRefreshToken = secureTokenService.GenerateToken();
            var refreshTokenHash = secureTokenService.HashToken(rawRefreshToken);

            session.SetRefreshToken(refreshTokenHash, clock);

            await sessionRepository.AddAsync(session, cancellationToken);
        }

        var accessToken = accessTokenGenerator.GenerateToken(user, session);

        return new AuthTokensResult(accessToken, rawRefreshToken, session.Id);
    }
}
