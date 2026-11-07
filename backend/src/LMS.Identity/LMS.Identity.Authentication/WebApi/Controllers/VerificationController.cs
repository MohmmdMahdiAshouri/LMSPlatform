using LMS.Identity.Authentication.Application.Commands.ResendVerification;
using LMS.Identity.Authentication.Application.Commands.VerifyEmail;
using LMS.Identity.Authentication.WebApi.Dtos;
using LMS.Shared.ResponseHandling;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Identity.Authentication.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VerificationController(ISender mediator) : ControllerBase
{
    [HttpPost("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail(
        [FromBody] VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        var command = new VerifyEmailCommand(request.VerificationToken);
        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        return result.ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Email verified successfully.");
    }

    [HttpPost("resend-verification-token")]
    [Authorize]
    public async Task<IActionResult> ResendVerification(CancellationToken cancellationToken)
    {
        var command = new ResendVerificationCommand();
        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        return result.ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Verification token sent successfully.");
    }
}
