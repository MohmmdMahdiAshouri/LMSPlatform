using LMS.Shared.Application.Cqrs;

namespace LMS.Identity.Authentication.Application.Commands.RevokeSession;

public sealed record RevokeSessionCommand(Guid SessionId) : ICommand<RevokeSessionResult>;
