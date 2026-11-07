using LMS.Identity.Authentication.Application.Abstractions;
using LMS.Identity.Authentication.Domain.Entities;
using LMS.Identity.Authentication.Domain.Repositories;
using LMS.Identity.Authentication.Domain.ValueObjects;
using LMS.Shared.Application.Cqrs;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Results;
using LMS.Shared.Domain.Abstractions;

namespace LMS.Identity.Authentication.Application.Commands.Register;

public sealed class RegisterCommandHandler(
    IUserRepository userRepository,
    IVerificationTokenRepository verificationTokenRepository,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    IAuthSessionCoordinator authSessionCoordinator,
    ISecureTokenService secureTokenService,
    ISystemClock clock) : ICommandHandler<RegisterCommand, RegisterResult>
{
    public async Task<Result<RegisterResult>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Construct Domain Value Objects (Self-validating invariants)
        var email = Email.Create(request.Email);
        var username = Username.Create(request.Username);
        var password = Password.Create(request.Password);

        // 2. Business uniqueness checks
        var existsEmail = await userRepository.EmailExistsAsync(email, cancellationToken);
        if (existsEmail)
        {
            return Result.Failure<RegisterResult>(
                Error.Conflict("A user with this email address already exists."));
        }

        var existsUsername = await userRepository.UsernameExistsAsync(username, cancellationToken);
        if (existsUsername)
        {
            return Result.Failure<RegisterResult>(
                Error.Conflict("A user with this username already exists."));
        }

        // 3. Secure password hashing
        var passwordHash = passwordHasher.Hash(password);

        // 4. Instantiate User Aggregate Root
        var user = User.Register(email, username, passwordHash, clock);
        await userRepository.AddAsync(user, cancellationToken);

        // 5. Establish Session and issue tokens via AuthSessionCoordinator
        var tokens = await authSessionCoordinator.IssueSessionAsync(
            user,
            request.IpAddress,
            request.UserAgent,
            cancellationToken);

        // 6. Generate one-time email Verification Token (15-min lifetime, SHA-256 hashed)
        var rawVerificationToken = secureTokenService.GenerateToken();
        var verificationTokenHash = secureTokenService.HashToken(rawVerificationToken);

        var verificationToken = VerificationToken.Create(
            user.Id,
            verificationTokenHash,
            rawVerificationToken,
            user.Email.Value,
            user.Username.Value,
            clock);
        await verificationTokenRepository.AddAsync(verificationToken, cancellationToken);

        // 7. Atomically persist User, Session, RefreshToken, VerificationToken and Outbox Messages
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 8. Return success result with tokens
        return Result.Success(new RegisterResult(tokens.AccessToken, tokens.RefreshToken));
    }
}
