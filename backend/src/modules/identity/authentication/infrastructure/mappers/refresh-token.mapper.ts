import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export class RefreshTokenMapper {
    static toDomain(prisma: PrismaRefreshToken): RefreshToken {
        return RefreshToken.restore(
            prisma.id,
            prisma.sessionId,
            prisma.tokenHash,
            prisma.expiresAt,
            prisma.revokedAt,
            prisma.createdAt,
        );
    }

    static toPersistence(token: RefreshToken): PrismaRefreshToken {
        return {
            id: token.getId(),
            sessionId: token.getSessionId(),
            tokenHash: token.getTokenHash(),
            expiresAt: token.getExpiresAt(),
            revokedAt: token.getRevokedAt(),
            createdAt: token.getCreatedAt(),
        };
    }
}
