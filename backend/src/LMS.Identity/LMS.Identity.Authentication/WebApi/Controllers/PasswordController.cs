using LMS.Identity.Authentication.Application.Commands.ChangePassword;
using LMS.Identity.Authentication.Application.Commands.ForgotPassword;
using LMS.Identity.Authentication.Application.Commands.ResetPassword;
using LMS.Identity.Authentication.WebApi.Dtos;
using LMS.Shared.ResponseHandling;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Identity.Authentication.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PasswordController(ISender mediator) : ControllerBase
{
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ForgotPasswordCommand(request.Email);
        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        return result.ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "If an account with that email exists, password reset instructions have been sent.");
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ResetPasswordCommand(request.Token, request.Password);
        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        return result.ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Password has been reset successfully. All active sessions have been terminated.");
    }

    [HttpPatch("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ChangePasswordCommand(request.CurrentPassword, request.NewPassword);
        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        return result.ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Password changed successfully. All other devices have been logged out.");
    }
}
