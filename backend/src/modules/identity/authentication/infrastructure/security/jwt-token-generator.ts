import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { AccessTokenPayload, AccessTokenGenerator } from '../../application/ports/access-token-generator.port';
import { User } from '../../domain/entities/user.entity';
import { Session } from '../../domain/entities/session.entity';

@Injectable()
export class JwtTokenGenerator implements AccessTokenGenerator {
    constructor(private readonly jwt: NestJwtService) {}

    generate(user: User, session: Session): Promise<string> {
        const payload = {
            sub: user.getId(),
            sessionId: session.getId(),
        };
        return this.jwt.signAsync(payload);
    }

    verify(token: string): Promise<AccessTokenPayload> {
        return this.jwt.verifyAsync(token);
    }
}
