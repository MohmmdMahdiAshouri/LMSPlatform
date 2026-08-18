import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { Inject } from '@nestjs/common';
import {
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
    TOKEN_HASHER,
    USER_REPOSITORY,
} from '../../tokens/injection.token';
import { SessionRepository } from '@modules/identity/authentication/domain/repositories/session.repository';
import { RefreshTokenRepository } from '@modules/identity/authentication/domain/repositories/refresh-token.repository';
import { InvalidRefreshTokenException } from '@modules/identity/authentication/domain/exceptions/invalid-refresh-token.exception';
import { SessionIsInvalidOrRevokedException } from '@modules/identity/authentication/domain/exceptions/session-is-invalid-or-revoked.exception';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { TokenHasher } from '../../ports/token-hasher.port';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthenticationResult } from '../../contracts/authentication-result';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
        private readonly authenticationService: AuthenticationService,
    ) {}
    async execute(command: RefreshTokenCommand): Promise<AuthenticationResult> {
        const hashedRefreshToken = this.tokenHasher.hash(command.refreshToken);

        const refreshToken = await this.refreshTokenRepository.findByTokenHash(hashedRefreshToken);
        if (!refreshToken || !refreshToken.isValid()) throw new InvalidRefreshTokenException();

        const session = await this.sessionRepository.findById(refreshToken.getSessionId());
        if (!session || !session.canRefresh()) throw new SessionIsInvalidOrRevokedException();

        const user = await this.userRepository.findById(session.getUserId());
        if (!user) throw new UserNotFoundException();

        return this.authenticationService.rotateRefreshToken(user, session);
    }
}
