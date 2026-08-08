import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendVerificationTokenCommand } from './resend-verification-token.command';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, VERIFICATION_TOKEN_REPOSITORY } from '../../tokens/injection.token';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { VerificationTokenRepository } from '@modules/identity/authentication/domain/repositories/verification-token.repository';
import { VerificationTokenService } from '../../services/verification-token.service';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { VerificationTokenResendTooSoonException } from '@modules/identity/authentication/domain/exceptions/verification-token-resend-too-soon.Exception';
import { EmailAlreadyVerifiedException } from '@modules/identity/authentication/domain/exceptions/email-already-verified.exception';

@CommandHandler(ResendVerificationTokenCommand)
export class ResendVerificationTokenHandler implements ICommandHandler<ResendVerificationTokenCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(VERIFICATION_TOKEN_REPOSITORY)
        private readonly verificationTokenRepository: VerificationTokenRepository,

        private readonly verificationTokenService: VerificationTokenService,
    ) {}
    async execute(command: ResendVerificationTokenCommand): Promise<any> {
        const email = Email.create(command.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundException();
        }
        if (user.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException(user.getEmail());
        }
        const oldVerificationToken = await this.verificationTokenRepository.findActiveByUserId(user.getId());

        if (oldVerificationToken) {
            if (Date.now() - oldVerificationToken.getCreatedAt().getTime() < 1000 * 60 * 2) {
                throw new VerificationTokenResendTooSoonException();
            }
            oldVerificationToken.revoke();
            await this.verificationTokenRepository.update(oldVerificationToken);
        }

        await this.verificationTokenService.create(user);
    }
}
