import { Session as PrismaSession } from '@prisma/client';
import { Session } from '../../domain/entities/session.entity';
import { SessionStatusMapper } from './session-status.mapper';
import { SessionDeviceTypeMapper } from './session-device-type.mapper';

export class SessionMapper {
    static toDomain(prisma: PrismaSession): Session {
        return Session.restore(
            prisma.id,
            prisma.userId,
            SessionStatusMapper.toDomain(prisma.status),
            SessionDeviceTypeMapper.toDomain(prisma.deviceType),
            prisma.browser,
            prisma.operatingSystem,
            prisma.ipAddress,
            prisma.userAgent,
            prisma.lastActivityAt,
            prisma.expiresAt,
            prisma.revokedAt,
            prisma.createdAt,
            prisma.updatedAt,
        );
    }

    static toPersistence(session: Session): PrismaSession {
        return {
            id: session.getId(),
            userId: session.getUserId(),
            status: SessionStatusMapper.toPersistence(session.getStatus()),
            deviceType: SessionDeviceTypeMapper.toPersistence(session.getDeviceType()),
            browser: session.getBrowser(),
            operatingSystem: session.getOperatingSystem(),
            ipAddress: session.getIpAddress(),
            userAgent: session.getUserAgent(),
            lastActivityAt: session.getLastActivityAt(),
            expiresAt: session.getExpiresAt(),
            revokedAt: session.getRevokedAt(),
            createdAt: session.getCreatedAt(),
            updatedAt: session.getUpdatedAt(),
        };
    }
}
