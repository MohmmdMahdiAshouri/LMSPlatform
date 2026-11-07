namespace LMS.Shared.Application.Abstractions.Security;

public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? SessionId { get; }
    string? Email { get; }
    string? Username { get; }
    bool IsAuthenticated { get; }
}
