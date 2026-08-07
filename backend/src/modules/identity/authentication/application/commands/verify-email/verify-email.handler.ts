import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from './verify-email.command';
import { AuthenticationResult } from '../../contracts/authentication-result';
import { Inject } from '@nestjs/common';
import { TOKEN_HASHER, USER_REPOSITORY, VERIFICATION_TOKEN_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { VerificationTokenRepository } from '@modules/identity/authentication/domain/repositories/verification-token.repository';
import { TokenHasher } from '../../ports/token-hasher.port';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthenticationService } from '../../services/authentication.service';
import { NotUsableVerificationTokenException } from '@modules/identity/authentication/domain/exceptions/invalid-verification-token.exception';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand, AuthenticationResult> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(VERIFICATION_TOKEN_REPOSITORY)
        private readonly verificationTokenRepository: VerificationTokenRepository,

        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,

        private readonly authenticationService: AuthenticationService,
    ) {}

    @Transactional()
    async execute(command: VerifyEmailCommand): Promise<AuthenticationResult> {
        const tokenHash = this.tokenHasher.hash(command.verificationToken);

        const verificationToken = await this.verificationTokenRepository.findByTokenHash(tokenHash);

        if (!verificationToken) {
            throw new NotUsableVerificationTokenException();
        }

        verificationToken.use();

        const user = await this.userRepository.findById(verificationToken.getUserId());

        if (!user) {
            throw new UserNotFoundException();
        }

        user.verifyEmail();

        await this.userRepository.update(user);
        await this.verificationTokenRepository.update(verificationToken);

        return this.authenticationService.authenticate(user, command.context);
    }
}
