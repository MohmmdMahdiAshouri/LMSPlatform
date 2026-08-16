import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { Inject } from '@nestjs/common';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordIsIncorrectException } from '@modules/identity/authentication/domain/exceptions/password-is-incorrect.exception';
import { UserInactiveException } from '@modules/identity/authentication/domain/exceptions/user-in-active.exception';
import { UserLockedException } from '@modules/identity/authentication/domain/exceptions/user-locked.exception';
import { PasswordLoginNotAvailableException } from '@modules/identity/authentication/domain/exceptions/password-login-not-available.exception';
import { AuthenticationResult } from '../../contracts/authentication-result';

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
        const user = await this.userRepository.findByLoginIdentifier(command.emailOrUsername);
        if (!user) {
            throw new UserNotFoundException();
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
            throw new PasswordIsIncorrectException();
        }

        //check user can login
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
}
