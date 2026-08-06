import { DeviceType } from '../../domain/enums/session.enum';

export interface AuthenticationContext {
    deviceType: DeviceType;
    browser: string;
    operatingSystem: string;
    ipAddress: string;
    userAgent: string;
}
