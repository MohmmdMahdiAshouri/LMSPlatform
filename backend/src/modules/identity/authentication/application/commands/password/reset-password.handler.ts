import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from './reset-password.command';
import {
    PASSWORD_HASHER,
    PASSWORD_RESET_TOKEN_REPOSITORY,
    TOKEN_HASHER,
    USER_REPOSITORY,
} from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { TokenHasher } from '../../ports/token-hasher.port';
import { PasswordResetTokenRepository } from '@modules/identity/authentication/domain/repositories/password-reset-token.repository';
import { NotUsablePasswordResetTokenException } from '@modules/identity/authentication/domain/exceptions/not-useble-password-reset-token.exception';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordHash } from '@modules/identity/authentication/domain/value-objects/password-hash.vo';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordSameAsOldException } from '@modules/identity/authentication/domain/exceptions/password-same-as-old.exception';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,

        private readonly authenticationService: AuthenticationService,
    ) {}
    @Transactional()
    async execute(command: ResetPasswordCommand): Promise<void> {
        const tokenHash = this.tokenHasher.hash(command.token);
        const resetPasswordToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
        if (!resetPasswordToken) throw new NotUsablePasswordResetTokenException();

        const newPassword = Password.create(command.password);

        const user = await this.userRepository.findById(resetPasswordToken.getUserId());
        if (!user) {
            throw new UserNotFoundException();
        }

        const isSamePassword =
            user.hasPassword() && (await this.passwordHasher.compare(newPassword, user.getPasswordHash()!));
        if (isSamePassword) throw new PasswordSameAsOldException();

        const hash = await this.passwordHasher.hash(newPassword);

        user.changePassword(PasswordHash.create(hash));
        resetPasswordToken.use();
        resetPasswordToken.revoke();

        await this.userRepository.update(user);
        await this.passwordResetTokenRepository.update(resetPasswordToken);

        //logout all sessions
        await this.authenticationService.revokeAllSessions(user.getId());
    }
}
