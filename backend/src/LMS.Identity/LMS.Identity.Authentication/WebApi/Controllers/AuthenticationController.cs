using LMS.Identity.Authentication.Application.Commands.Login;
using LMS.Identity.Authentication.Application.Commands.RefreshToken;
using LMS.Identity.Authentication.Application.Commands.Register;
using LMS.Identity.Authentication.Application.Queries.GetCurrentUser;
using LMS.Identity.Authentication.Infrastructure.Options;
using LMS.Identity.Authentication.WebApi.Dtos;
using LMS.Identity.Authentication.WebApi.Services;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.ResponseHandling;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LMS.Identity.Authentication.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController(
    ISender mediator,
    IAuthCookieService cookieService,
    IOptions<GoogleAuthOptions> googleOptions) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var command = new RegisterCommand(
            request.Email,
            request.Username,
            request.Password,
            ipAddress,
            userAgent);

        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        cookieService.SetRefreshToken(result.Value!.RefreshToken);

        var response = new AuthResponse(result.Value.AccessToken);
        return Result.Success(response).ToActionResult(
            HttpContext,
            StatusCodes.Status201Created,
            "User registered successfully.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var command = new LoginCommand(
            request.Identifier,
            request.Password,
            ipAddress,
            userAgent);

        var result = await mediator.Send(command, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToActionResult(HttpContext);
        }

        cookieService.SetRefreshToken(result.Value!.RefreshToken);

        var response = new AuthResponse(result.Value.AccessToken);
        return Result.Success(response).ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Logged in successfully.");
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(CancellationToken cancellationToken)
    {
        var refreshToken = cookieService.GetRefreshToken();
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Result.Failure(Error.Unauthorized("Refresh token cookie is missing."))
                .ToActionResult(HttpContext);
        }

        var command = new RefreshTokenCommand(refreshToken);
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            cookieService.ClearRefreshToken();
            return result.ToActionResult(HttpContext);
        }

        var response = new AuthResponse(result.Value!.AccessToken);
        return Result.Success(response).ToActionResult(
            HttpContext,
            StatusCodes.Status200OK,
            "Access token refreshed successfully.");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCurrentUserQuery(), cancellationToken);
        return result.ToActionResult(HttpContext);
    }

    [HttpGet("google")]
    [AllowAnonymous]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/"
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/callback")]
    [AllowAnonymous]
    public IActionResult GoogleCallback()
    {
        return Redirect($"{googleOptions.Value.SuccessRedirect}?error=google_oauth_failed");
    }
}