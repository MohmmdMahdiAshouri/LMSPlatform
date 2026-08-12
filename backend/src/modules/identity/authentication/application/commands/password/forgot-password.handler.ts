import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { PASSWORD_RESET_TOKEN_REPOSITORY, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { TokenGeneratorFactory } from '../../factories/token-generator.factory';
import { PasswordResetToken } from '@modules/identity/authentication/domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '@modules/identity/authentication/domain/repositories/password-reset-token.repository';
import { EmailProducer } from '../../producers/email.producer';
import { Transactional } from '@nestjs-cls/transactional';
import { PasswordResetTokenTooSoonException } from '@modules/identity/authentication/domain/exceptions/password-reset-token-too-soon.exception';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        private readonly tokenGeneratorFactory: TokenGeneratorFactory,

        @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

        private readonly emailProducer: EmailProducer,
    ) {}
    @Transactional()
    async execute(command: ForgotPasswordCommand): Promise<void> {
        //find user
        const email = Email.create(command.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundException();
        }

        //revoke perevious token
        const oldPasswordResetToken = await this.passwordResetTokenRepository.findActiveByUserId(user.getId());
        if (oldPasswordResetToken) {
            if (Date.now() - oldPasswordResetToken.getCreatedAt().getTime() < 1000 * 60 * 2) {
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

        //send email
        await this.emailProducer.sendPasswordResetEmail(email.getValue(), plainToken);
    }
}
