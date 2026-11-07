using LMS.Shared.Application.Abstractions.Security;
using Microsoft.AspNetCore.Http;

namespace LMS.Shared.Infrastructure.Security;

public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private HttpContext? HttpContext => httpContextAccessor.HttpContext;

    public Guid? UserId => HttpContext?.User.GetUserId();

    public Guid? SessionId => HttpContext?.User.GetSessionId();

    public string? Email => HttpContext?.User.GetEmail();

    public string? Username => HttpContext?.User.GetUsername();

    public bool IsAuthenticated => HttpContext?.User.IsAuthenticated() == true;
}
