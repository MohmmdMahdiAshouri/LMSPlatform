import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(refreshToken: RefreshToken): Promise<void> {
        await this.txHost.tx.refreshToken.create({
            data: RefreshTokenMapper.toPersistence(refreshToken),
        });
    }

    async update(refreshToken: RefreshToken): Promise<void> {
        await this.txHost.tx.refreshToken.update({
            where: { id: refreshToken.getId() },
            data: { tokenHash: refreshToken.getTokenHash(), expiresAt: refreshToken.getExpiresAt() },
        });
    }

    async findById(id: string): Promise<RefreshToken | null> {
        const refreshToken = await this.txHost.tx.refreshToken.findUnique({
            where: { id },
        });
        if (!refreshToken) return null;
        return RefreshTokenMapper.toDomain(refreshToken);
    }

    async findBySessionId(sessionId: string): Promise<RefreshToken | null> {
        const refreshToken = await this.txHost.tx.refreshToken.findFirst({
            where: { sessionId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!refreshToken) return null;
        return RefreshTokenMapper.toDomain(refreshToken);
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const refreshToken = await this.txHost.tx.refreshToken.findFirst({
            where: { tokenHash },
        });
        if (!refreshToken) return null;
        return RefreshTokenMapper.toDomain(refreshToken);
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.refreshToken.delete({
            where: { id },
        });
    }
}
