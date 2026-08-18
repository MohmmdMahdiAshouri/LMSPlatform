import { Session } from '../entities/session.entity';
import { DeviceType } from '../enums/session.enum';

export abstract class SessionRepository {
    abstract save(session: Session): Promise<void>;

    abstract update(session: Session): Promise<void>;

    abstract findById(id: string): Promise<Session | null>;

    abstract findActiveByUserAndDevice(
        userId: string,
        deviceType: DeviceType,
        browser: string,
        operatingSystem: string,
    ): Promise<Session | null>;

    abstract findAllActiveByUserId(userId: string): Promise<Session[]>;

    abstract delete(id: string): Promise<void>;
}
