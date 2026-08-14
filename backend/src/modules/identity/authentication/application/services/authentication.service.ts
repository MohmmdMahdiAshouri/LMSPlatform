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
import { RefreshTokenNotFoundException } from '../../domain/exceptions/refresh-token-not-found.exception';
import { Transactional } from '@nestjs-cls/transactional';

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

    @Transactional()
    async authenticate(user: User, context: AuthenticationContext): Promise<AuthenticationResult> {
        const existingSession = await this.sessionRepository.findActiveByUserAndDevice(
            user.getId(),
            context.deviceType,
            context.browser,
            context.operatingSystem,
        );

        if (existingSession) {
            return this.reuseSession(user, existingSession);
        }

        return this.createNewSession(user, context);
    }

    private async createNewSession(user: User, context: AuthenticationContext): Promise<AuthenticationResult> {
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

    private async reuseSession(user: User, session: Session): Promise<AuthenticationResult> {
        const plainRefreshToken = this.tokenGenerator.generate();
        const hashedRefreshToken = this.tokenHasher.hash(plainRefreshToken);

        const refreshToken = await this.refreshTokenRepository.findBySessionId(session.getId());
        if (!refreshToken) {
            throw new RefreshTokenNotFoundException();
        }

        const expiresAt = new Date(
            this.clock.now().getTime() + AuthenticationService.EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
        );

        refreshToken.rotate(hashedRefreshToken, expiresAt);

        await this.refreshTokenRepository.update(refreshToken);

        const accessToken = await this.accessTokenGenerator.generate(user, session);

        return {
            accessToken,
            refreshToken: plainRefreshToken,
        };
    }

    @Transactional()
    async revokeAllSessions(userId: string): Promise<void> {
        const sessions = await this.sessionRepository.findAllActiveByUserId(userId);

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

    async revokeAllSessionsExcept(userId: string, currentSessionId: string) {
        const allSessions = await this.sessionRepository.findAllActiveByUserId(userId);
        const sessions = allSessions.filter((s) => s.getId() !== currentSessionId);

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
