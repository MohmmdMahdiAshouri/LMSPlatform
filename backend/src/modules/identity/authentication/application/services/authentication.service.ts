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
import { Inject, Injectable } from '@nestjs/common';
import {
    CLOCK,
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
    TOKEN_GENERATOR,
    TOKEN_HASHER,
} from '../tokens/injection.token';
import { RefreshTokenNotFoundException } from '../../domain/exceptions/refresh-token-not-found.exception';
import { Transactional } from '@nestjs-cls/transactional';
import { SessionIsInvalidOrRevokedException } from '../../domain/exceptions/session-is-invalid-or-revoked.exception';
import { AUTH_CONFIG } from '../config/auth-config';
@Injectable()
export class AuthenticationService {
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
            return this.rotateRefreshToken(user, existingSession);
        }

        return this.createNewSession(user, context);
    }

    async createNewSession(user: User, context: AuthenticationContext): Promise<AuthenticationResult> {
        //generate refresh token
        const plainRefreshToken = this.tokenGenerator.generate();
        const hashedRefreshToken = this.tokenHasher.hash(plainRefreshToken);

        //create session and refresh token
        const now = this.clock.now();
        const expiresAt = new Date(now.getTime() + AUTH_CONFIG.SESSION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
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

    @Transactional()
    async rotateRefreshToken(user: User, session: Session): Promise<AuthenticationResult> {
        const plainRefreshToken = this.tokenGenerator.generate();
        const hashedRefreshToken = this.tokenHasher.hash(plainRefreshToken);

        const refreshToken = await this.refreshTokenRepository.findBySessionId(session.getId());
        if (!refreshToken) {
            throw new RefreshTokenNotFoundException();
        }

        refreshToken.rotate(hashedRefreshToken);
        await this.refreshTokenRepository.update(refreshToken);

        //keep lastActivityAt accurate while preserving the absolute 15-day expiry
        session.refreshActivity(this.clock.now(), session.getExpiresAt());
        await this.sessionRepository.update(session);

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
            await this.revokeSessionAndToken(session);
        }
    }

    @Transactional()
    async revokeSession(userId: string, sessionId: string): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session || session.isRevoked()) throw new SessionIsInvalidOrRevokedException();

        if (session.getUserId() !== userId) throw new SessionIsInvalidOrRevokedException();

        await this.revokeSessionAndToken(session);
    }

    async revokeSessionAndToken(session: Session): Promise<void> {
        const refreshToken = await this.refreshTokenRepository.findBySessionId(session.getId());
        if (!refreshToken) throw new RefreshTokenNotFoundException();

        refreshToken.revoke();
        await this.refreshTokenRepository.update(refreshToken);
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
