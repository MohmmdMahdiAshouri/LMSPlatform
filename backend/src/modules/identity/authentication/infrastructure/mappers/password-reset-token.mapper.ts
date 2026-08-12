import { VerificationToken as PrismaVerificationToken } from '@prisma/client';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export class PasswordResetTokenMapper {
    static toDomain(prisma: PrismaVerificationToken): PasswordResetToken {
        return PasswordResetToken.restore(
            prisma.id,
            prisma.userId,
            prisma.tokenHash,
            prisma.expiresAt,
            prisma.usedAt,
            prisma.revokedAt,
            prisma.createdAt,
        );
    }

    static toPersistence(passwordResetToken: PasswordResetToken) {
        return {
            id: passwordResetToken.getId(),
            userId: passwordResetToken.getUserId(),
            tokenHash: passwordResetToken.getTokenHash(),
            expiresAt: passwordResetToken.getExpiresAt(),
            usedAt: passwordResetToken.getUsedAt(),
            revokedAt: passwordResetToken.getRevokedAt(),
            createdAt: passwordResetToken.getCreatedAt(),
        };
    }
}
