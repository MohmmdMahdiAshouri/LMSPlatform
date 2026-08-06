import { Session } from '../entities/session.entity';

export abstract class SessionRepository {
    abstract save(session: Session, context?: unknown): Promise<void>;

    abstract update(session: Session): Promise<void>;

    abstract findById(id: string): Promise<Session | null>;

    abstract delete(id: string): Promise<void>;
}
