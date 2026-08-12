import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(passwordResetToken: PasswordResetToken): Promise<void> {
        await this.txHost.tx.passwordResetToken.create({
            data: PasswordResetTokenMapper.toPersistence(passwordResetToken),
        });
    }

    async update(passwordResetToken: PasswordResetToken): Promise<void> {
        await this.txHost.tx.passwordResetToken.update({
            where: { id: passwordResetToken.getId() },
            data: PasswordResetTokenMapper.toPersistence(passwordResetToken),
        });
    }

    async findById(id: string): Promise<PasswordResetToken | null> {
        const passwordResetToken = await this.txHost.tx.passwordResetToken.findUnique({
            where: { id },
        });
        if (!passwordResetToken) return null;
        return PasswordResetTokenMapper.toDomain(passwordResetToken);
    }

    async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
        const passwordResetToken = await this.txHost.tx.passwordResetToken.findUnique({
            where: {
                tokenHash,
            },
        });
        if (!passwordResetToken) return null;
        return PasswordResetTokenMapper.toDomain(passwordResetToken);
    }

    async findActiveByUserId(userId: string): Promise<PasswordResetToken | null> {
        const passwordResetToken = await this.txHost.tx.passwordResetToken.findFirst({
            where: { userId, usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!passwordResetToken) return null;
        return PasswordResetTokenMapper.toDomain(passwordResetToken);
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.passwordResetToken.delete({
            where: { id },
        });
    }
}
