import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { AccessTokenPayload } from '../../application/ports/access-token-generator.port';
import { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { SessionIsInvalidOrRevokedException } from '../../domain/exceptions/session-is-invalid-or-revoked.exception';
import { SESSION_REPOSITORY } from '../../application/tokens/injection.token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
        const session = await this.sessionRepository.findById(payload.sessionId);

        if (!session || session.isRevoked() || session.getUserId() !== payload.sub) {
            throw new SessionIsInvalidOrRevokedException();
        }

        return { userId: payload.sub, sessionId: payload.sessionId };
    }
}
