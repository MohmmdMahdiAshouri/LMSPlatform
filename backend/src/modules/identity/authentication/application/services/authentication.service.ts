import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { Session } from '../../domain/entities/session.entity';
import { User } from '../../domain/entities/user.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuthenticationContext } from '../contracts/authentication-context';
import { AuthenticationResult } from '../contracts/authentication-result';
import { AccessTokenGenerator } from '../ports/access-token-generator.port';
import { Clock } from '../ports/clock.port';
import { TokenGenerator } from '../ports/token-generator.port';
import { TokenHasher } from '../ports/token-hasher.port';
import { Inject } from '@nestjs/common';
import {
    CLOCK,
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
    TOKEN_GENERATOR,
    TOKEN_HASHER,
} from '../tokens/injection.token';

export class AuthenticationService {
    private static readonly EXPIRES_IN_DAYS = 15;

    constructor(
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
        private readonly accessTokenGenerator: AccessTokenGenerator,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
        @Inject(CLOCK)
        private readonly clock: Clock,
    ) {}

    @Transactional(Propagation.RequiresNew)
    async create(user: User, context: AuthenticationContext): Promise<AuthenticationResult> {
        //generate refresh token
        const plainRefreshToken = this.tokenGenerator.generate();
        const hashedRefreshToken = this.tokenHasher.hash(plainRefreshToken);

        //create session and refresh token
        const now = this.clock.now();
        const expiresAt = new Date(now.getTime() + AuthenticationService.EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
        const session = Session.create(
            user.getId(),
            context.deviceType,
            context.browser,
            context.operatingSystem,
            context.ipAddress,
            context.userAgent,
            now,
            expiresAt,
        );
        const refreshToken = RefreshToken.create(session.getId(), hashedRefreshToken, expiresAt);

        // save transaction
        await this.sessionRepository.save(session);
        await this.refreshTokenRepository.save(refreshToken);

        //generate access token
        const accessToken = await this.accessTokenGenerator.generate(user, session);

        return {
            accessToken,
            refreshToken: plainRefreshToken,
        };
    }
}
