using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.RefreshToken;

public sealed record RefreshTokenCommand(string RawRefreshToken) : ICommand<RefreshTokenResult>;
