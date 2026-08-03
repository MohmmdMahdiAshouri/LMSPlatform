import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import { VerificationToken } from '../../domain/entities/verification-token.entity';
import { VerificationTokenMapper } from '../mappers/verification-token.mapper';

@Injectable()
export class PrismaVerificationTokenRepository implements VerificationTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(verificationToken: VerificationToken): Promise<void> {
        await this.prisma.verificationToken.create({
            data: VerificationTokenMapper.toPersistence(verificationToken),
        });
    }

    async findById(id: string): Promise<VerificationToken | null> {
        const verificationToken = await this.prisma.verificationToken.findUnique({
            where: { id },
        });
        if (!verificationToken) return null;
        return VerificationTokenMapper.toDomain(verificationToken);
    }

    async findActiveByUserId(userId: string): Promise<VerificationToken | null> {
        const verificationToken = await this.prisma.verificationToken.findFirst({
            where: { userId, usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!verificationToken) return null;
        return VerificationTokenMapper.toDomain(verificationToken);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.verificationToken.delete({
            where: { id },
        });
    }
}
