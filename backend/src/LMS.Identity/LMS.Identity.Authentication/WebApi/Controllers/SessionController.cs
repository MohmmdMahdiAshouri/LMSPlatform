using LMS.Identity.Authentication.Application.Commands.Logout;
using LMS.Identity.Authentication.Application.Commands.LogoutAll;
using LMS.Identity.Authentication.Application.Commands.RevokeSession;
using LMS.Identity.Authentication.Application.Queries.GetActiveSessions;
using LMS.Identity.Authentication.WebApi.Services;
using LMS.Shared.ResponseHandling;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Identity.Authentication.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionController(
    ISender mediator,
    IAuthCookieService cookieService) : ControllerBase
{
    [HttpGet("sessions")]
    public async Task<IActionResult> GetActiveSessions(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetActiveSessionsQuery(), cancellationToken);
        return result.ToActionResult(HttpContext);
    }

    [HttpDelete("logout")]
    public async Task<IActionResult> LogoutCurrentSession(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new LogoutCommand(), cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        cookieService.ClearRefreshToken();
        return result.ToActionResult(HttpContext, StatusCodes.Status200OK, "Logged out successfully.");
    }

    [HttpDelete("logout-all")]
    public async Task<IActionResult> LogoutAllSessions(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new LogoutAllCommand(), cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        cookieService.ClearRefreshToken();
        return result.ToActionResult(HttpContext, StatusCodes.Status200OK, "Logged out from all devices successfully.");
    }

    [HttpDelete("{sessionId:guid}")]
    public async Task<IActionResult> RevokeSpecificSession(
        [FromRoute] Guid sessionId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RevokeSessionCommand(sessionId), cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        if (result.Value!.WasCurrentSession)
        {
            cookieService.ClearRefreshToken();
        }

        return result.ToActionResult(HttpContext, StatusCodes.Status200OK, "Device logged out successfully.");
    }
}
