import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { Inject } from '@nestjs/common';
import { PASSWORD_HASHER, SESSION_REPOSITORY, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordSameAsOldException } from '@modules/identity/authentication/domain/exceptions/password-same-as-old.exception';
import { PasswordIsIncorrectException } from '@modules/identity/authentication/domain/exceptions/password-is-incorrect.exception';
import { PasswordLoginNotAvailableException } from '@modules/identity/authentication/domain/exceptions/password-login-not-available.exception';
import { SessionRepository } from '@modules/identity/authentication/domain/repositories/session.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthenticationService } from '../../services/authentication.service';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        private readonly authenticationService: AuthenticationService,
    ) {}
    @Transactional()
    async execute(command: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new UserNotFoundException();
        }
        const currentPassword = Password.create(command.currentPassword);
        const newPassword = Password.create(command.newPassword);

        if (!user.hasPassword()) {
            throw new PasswordLoginNotAvailableException();
        }

        const isValidCurrentPassword = await this.passwordHasher.compare(currentPassword, user.getPasswordHash()!);
        if (!isValidCurrentPassword) throw new PasswordIsIncorrectException();

        const isSamePassword = await this.passwordHasher.compare(newPassword, user.getPasswordHash()!);
        if (isSamePassword) throw new PasswordSameAsOldException();

        const passwordHash = await this.passwordHasher.hashToValueObject(newPassword);

        user.changePassword(passwordHash);
        await this.userRepository.update(user);

        //logout all sessions except the current one
        const allSessions = await this.sessionRepository.findAllActiveByUserId(user.getId());
        const sessions = allSessions.filter((s) => s.getId() !== command.sessionId);

        for (const session of sessions) {
            await this.authenticationService.revokeSessionAndToken(session);
        }
    }
}
