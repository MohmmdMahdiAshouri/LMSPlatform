import { DeviceType } from '../../domain/enums/session.enum';

export interface ActiveSession {
    id: string;
    deviceType: DeviceType;
    browser: string;
    os: string;
    lastActivityAt: Date;
    expiresAt: Date;
}
