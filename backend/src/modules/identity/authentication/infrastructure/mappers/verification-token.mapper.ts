import { VerificationToken as PrismaVerificationToken } from '@prisma/client';
import { VerificationToken } from '../../domain/entities/verification-token.entity';

export class VerificationTokenMapper {
    static toDomain(prisma: PrismaVerificationToken): VerificationToken {
        return VerificationToken.create(prisma.userId, prisma.tokenHash, prisma.expiresAt);
    }

    static toPersistence(verificationToken: VerificationToken) {
        return {
            id: verificationToken.getId(),
            userId: verificationToken.getUserId(),
            tokenHash: verificationToken.getTokenHash(),
            expiresAt: verificationToken.getExpiresAt(),
            usedAt: verificationToken.getUsedAt(),
            revokedAt: verificationToken.getRevokedAt(),
            createdAt: verificationToken.getCreatedAt(),
        };
    }
}
