import { DeviceType as PrismaDeviceType } from '@prisma/client';
import { DeviceType } from '../../domain/enums/session.enum';

export class SessionDeviceTypeMapper {
    static toDomain(deviceType: PrismaDeviceType): DeviceType {
        switch (deviceType) {
            case PrismaDeviceType.DESKTOP:
                return DeviceType.DESKTOP;
            case PrismaDeviceType.MOBILE:
                return DeviceType.MOBILE;
            case PrismaDeviceType.TABLET:
                return DeviceType.TABLET;
            case PrismaDeviceType.UNKNOWN:
                return DeviceType.UNKNOWN;
            default:
                return DeviceType.UNKNOWN;
        }
    }

    static toPersistence(deviceType: DeviceType): PrismaDeviceType {
        switch (deviceType) {
            case DeviceType.DESKTOP:
                return PrismaDeviceType.DESKTOP;
            case DeviceType.MOBILE:
                return PrismaDeviceType.MOBILE;
            case DeviceType.TABLET:
                return PrismaDeviceType.TABLET;
            case DeviceType.UNKNOWN:
                return PrismaDeviceType.UNKNOWN;
        }
    }
}
