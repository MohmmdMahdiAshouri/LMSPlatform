import { SessionStatus as PrismaSessionStatus } from '@prisma/client';
import { SessionStatus } from '../../domain/enums/session.enum';

export class SessionStatusMapper {
    static toDomain(status: PrismaSessionStatus): SessionStatus {
        switch (status) {
            case PrismaSessionStatus.ACTIVE:
                return SessionStatus.ACTIVE;
            case PrismaSessionStatus.EXPIRED:
                return SessionStatus.EXPIRED;
            case PrismaSessionStatus.REVOKED:
                return SessionStatus.REVOKED;
        }
    }

    static toPersistence(status: SessionStatus): PrismaSessionStatus {
        switch (status) {
            case SessionStatus.ACTIVE:
                return PrismaSessionStatus.ACTIVE;
            case SessionStatus.EXPIRED:
                return PrismaSessionStatus.EXPIRED;
            case SessionStatus.REVOKED:
                return PrismaSessionStatus.REVOKED;
        }
    }
}
