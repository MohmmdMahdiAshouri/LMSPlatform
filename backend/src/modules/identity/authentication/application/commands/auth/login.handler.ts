import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { Inject } from '@nestjs/common';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordLoginNotAvailableException } from '@modules/identity/authentication/domain/exceptions/password-login-not-available.exception';
import { InvalidCredentialsException } from '@modules/identity/authentication/domain/exceptions/invalid-credentials.exception';
import { AuthenticationResult } from '../../contracts/authentication-result';
import { UserLockedException } from '@modules/identity/authentication/domain/exceptions/user-locked.exception';
import { UserInactiveException } from '@modules/identity/authentication/domain/exceptions/user-in-active.exception';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,

        private readonly authenticationService: AuthenticationService,
    ) {}

    async execute(command: LoginCommand): Promise<AuthenticationResult> {
        //find user
        const user = await this.userRepository.findByLoginIdentifier(this.normalizeIdentifier(command.emailOrUsername));
        if (!user) {
            throw new InvalidCredentialsException();
        }

        //check user password
        if (!user.hasPassword()) {
            throw new PasswordLoginNotAvailableException();
        }
        const password = Password.create(command.password);
        const isTruePassword = await this.passwordHasher.compare(password, user.getPasswordHash()!);
        if (!isTruePassword) {
            user.recordFailedLogin();
            await this.userRepository.update(user);
            throw new InvalidCredentialsException();
        }

        //check user can login — failures below are intentionally unified to prevent user enumeration
        if (!user.isActive()) {
            throw new UserInactiveException();
        }

        if (user.isLocked()) {
            throw new UserLockedException(user.getLockedUntil());
        }

        user.recordSuccessfulLogin();
        await this.userRepository.update(user);

        return this.authenticationService.authenticate(user, command.context);
    }

    private normalizeIdentifier(identifier: string): string {
        // emails are stored lowercased at registration — normalize login input to match
        if (identifier.includes('@')) {
            return identifier.trim().toLowerCase();
        }
        return identifier;
    }
}
