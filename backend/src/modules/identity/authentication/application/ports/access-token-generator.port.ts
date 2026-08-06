import { Session } from '../../domain/entities/session.entity';
import { User } from '../../domain/entities/user.entity';

export interface AccessTokenPayload {
    sub: string;
    sessionId: string;
}

export abstract class AccessTokenGenerator {
    abstract generate(user: User, session: Session): Promise<string>;

    abstract verify(token: string): Promise<AccessTokenPayload>;
}
