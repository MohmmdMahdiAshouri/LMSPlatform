import { RefreshToken } from '../entities/refresh-token.entity';

export abstract class RefreshTokenRepository {
    abstract save(refreshToken: RefreshToken, context?: unknown): Promise<void>;

    abstract findById(id: string): Promise<RefreshToken | null>;

    abstract findBySessionId(sessionId: string): Promise<RefreshToken | null>;

    abstract delete(id: string): Promise<void>;
}
