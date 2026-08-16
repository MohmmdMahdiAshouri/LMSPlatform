import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { Inject } from '@nestjs/common';
import {
    PASSWORD_HASHER,
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
    USER_REPOSITORY,
} from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordSameAsOldException } from '@modules/identity/authentication/domain/exceptions/password-same-as-old.exception';
import { PasswordHash } from '@modules/identity/authentication/domain/value-objects/password-hash.vo';
import { PasswordIsIncorrectException } from '@modules/identity/authentication/domain/exceptions/password-is-incorrect.exception';
import { PasswordLoginNotAvailableException } from '@modules/identity/authentication/domain/exceptions/password-login-not-available.exception';
import { SessionRepository } from '@modules/identity/authentication/domain/repositories/session.repository';
import { RefreshTokenRepository } from '@modules/identity/authentication/domain/repositories/refresh-token.repository';
import { RefreshTokenNotFoundException } from '@modules/identity/authentication/domain/exceptions/refresh-token-not-found.exception';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
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

        const hash = await this.passwordHasher.hash(newPassword);

        user.changePassword(PasswordHash.create(hash));
        await this.userRepository.update(user);

        //logout all sessions
        const allSessions = await this.sessionRepository.findAllActiveByUserId(user.getId());
        const sessions = allSessions.filter((s) => s.getId() !== command.sessionId);

        for (const session of sessions) {
            session.revoke();
            await this.sessionRepository.update(session);

            const refreshToken = await this.refreshTokenRepository.findBySessionId(session.getId());

            if (!refreshToken) {
                throw new RefreshTokenNotFoundException();
            }

            refreshToken.revoke();
            await this.refreshTokenRepository.update(refreshToken);
        }
    }
}
