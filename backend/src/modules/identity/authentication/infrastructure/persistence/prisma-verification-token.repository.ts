import { Injectable } from '@nestjs/common';
import { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import { VerificationToken } from '../../domain/entities/verification-token.entity';
import { VerificationTokenMapper } from '../mappers/verification-token.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class PrismaVerificationTokenRepository implements VerificationTokenRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(verificationToken: VerificationToken): Promise<void> {
        await this.txHost.tx.verificationToken.create({
            data: VerificationTokenMapper.toPersistence(verificationToken),
        });
    }

    async update(verificationToken: VerificationToken): Promise<void> {
        await this.txHost.tx.verificationToken.update({
            where: { id: verificationToken.getId() },
            data: VerificationTokenMapper.toPersistence(verificationToken),
        });
    }

    async findById(id: string): Promise<VerificationToken | null> {
        const verificationToken = await this.txHost.tx.verificationToken.findUnique({
            where: { id },
        });
        if (!verificationToken) return null;
        return VerificationTokenMapper.toDomain(verificationToken);
    }

    async findByTokenHash(tokenHash: string): Promise<VerificationToken | null> {
        const verificationToken = await this.txHost.tx.verificationToken.findUnique({
            where: {
                tokenHash,
            },
        });
        if (!verificationToken) return null;
        return VerificationTokenMapper.toDomain(verificationToken);
    }

    async findActiveByUserId(userId: string): Promise<VerificationToken | null> {
        const verificationToken = await this.txHost.tx.verificationToken.findFirst({
            where: { userId, usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!verificationToken) return null;
        return VerificationTokenMapper.toDomain(verificationToken);
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.verificationToken.delete({
            where: { id },
        });
    }
}
