import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { PASSWORD_RESET_TOKEN_REPOSITORY, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { TokenGeneratorFactory } from '../../factories/token-generator.factory';
import { PasswordResetToken } from '@modules/identity/authentication/domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '@modules/identity/authentication/domain/repositories/password-reset-token.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { OutboxMessage } from '@shared/common/domain/outbox-message.entity';
import type { OutboxMessageRepository } from '@shared/common/application/outbox-message.repository';
import { OUTBOX_REPOSITORY } from '@shared/common/domain/injection.token';
import { PasswordResetTokenEvent } from '../../events/password-reset-token.event';
import { AUTH_CONFIG } from '../../config/auth-config';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordResetTokenTooSoonException } from '@modules/identity/authentication/domain/exceptions/password-reset-token-too-soon.exception';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        private readonly tokenGeneratorFactory: TokenGeneratorFactory,

        @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: OutboxMessageRepository,
    ) {}

    @Transactional()
    async execute(command: ForgotPasswordCommand): Promise<void> {
        //find user
        const email = Email.create(command.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundException();
        }

        //revoke previous token
        const oldPasswordResetToken = await this.passwordResetTokenRepository.findActiveByUserId(user.getId());
        if (oldPasswordResetToken) {
            if (Date.now() - oldPasswordResetToken.getCreatedAt().getTime() < AUTH_CONFIG.RESEND_COOLDOWN_MS) {
                throw new PasswordResetTokenTooSoonException();
            }
            oldPasswordResetToken.revoke();
            await this.passwordResetTokenRepository.update(oldPasswordResetToken);
        }

        //generate token
        const { tokenHash, plainToken, expiresAt } = this.tokenGeneratorFactory.create();

        //create token
        const passwordResetToken = PasswordResetToken.create(user.getId(), tokenHash, expiresAt);

        //save token
        await this.passwordResetTokenRepository.save(passwordResetToken);

        //enqueue email delivery through the outbox (same transaction)
        const outboxMessage = OutboxMessage.create(PasswordResetTokenEvent.TYPE, {
            email: email.getValue(),
            passwordResetToken: plainToken,
        });
        await this.outboxRepository.save(outboxMessage);
    }
}
