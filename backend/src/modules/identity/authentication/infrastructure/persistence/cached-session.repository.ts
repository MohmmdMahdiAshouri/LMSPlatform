// infrastructure/persistence/cached-session.repository.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { Session } from '../../domain/entities/session.entity';
import { DeviceType } from '../../domain/enums/session.enum';
import { REDIS_CLIENT } from '@shared/redis/redis.module';
import { PrismaSessionRepository } from './prisma-session.repository';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SerializedSessionDto } from './dto/serialized-session.dto';
import { AUTH_CONFIG } from '../../application/config/auth-config';

const cacheKey = (sessionId: string) => `session:${sessionId}`;

@Injectable()
export class CachedSessionRepository implements SessionRepository {
    private readonly logger = new Logger(CachedSessionRepository.name);

    constructor(
        private readonly prismaSessionRepository: PrismaSessionRepository,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) {}

    async findById(id: string): Promise<Session | null> {
        const cached = await this.safeGet(cacheKey(id));
        if (cached) {
            const session = await this.tryDeserialize(cached, id);
            if (session) return session;
        }

        const session = await this.prismaSessionRepository.findById(id);
        if (!session) return null;

        await this.safeSet(cacheKey(id), this.serialize(session));
        return session;
    }

    async save(session: Session): Promise<void> {
        await this.prismaSessionRepository.save(session);
    }

    async update(session: Session): Promise<void> {
        await this.prismaSessionRepository.update(session);
        await this.safeDel(cacheKey(session.getId()));
    }

    async delete(id: string): Promise<void> {
        await this.prismaSessionRepository.delete(id);
        await this.safeDel(cacheKey(id));
    }

    async findActiveByUserAndDevice(
        userId: string,
        deviceType: DeviceType,
        browser: string,
        operatingSystem: string,
    ): Promise<Session | null> {
        return this.prismaSessionRepository.findActiveByUserAndDevice(userId, deviceType, browser, operatingSystem);
    }

    async findAllActiveByUserId(userId: string): Promise<Session[]> {
        return this.prismaSessionRepository.findAllActiveByUserId(userId);
    }

    private serialize(session: Session): string {
        const data: SerializedSessionDto = {
            id: session.getId(),
            userId: session.getUserId(),
            status: session.getStatus(),
            deviceType: session.getDeviceType(),
            browser: session.getBrowser(),
            operatingSystem: session.getOperatingSystem(),
            ipAddress: session.getIpAddress(),
            userAgent: session.getUserAgent(),
            lastActivityAt: session.getLastActivityAt().toISOString(),
            expiresAt: session.getExpiresAt().toISOString(),
            revokedAt: session.getRevokedAt()?.toISOString() ?? null,
            createdAt: session.getCreatedAt().toISOString(),
            updatedAt: session.getUpdatedAt().toISOString(),
        };
        return JSON.stringify(data);
    }

    private async tryDeserialize(raw: string, id: string): Promise<Session | null> {
        try {
            const parsed: unknown = JSON.parse(raw);
            const dto = plainToInstance(SerializedSessionDto, parsed);
            const errors = validateSync(dto);

            if (errors.length > 0) {
                await this.safeDel(cacheKey(id));
                return null;
            }

            return Session.restore(
                dto.id,
                dto.userId,
                dto.status,
                dto.deviceType,
                dto.browser,
                dto.operatingSystem,
                dto.ipAddress,
                dto.userAgent,
                new Date(dto.lastActivityAt),
                new Date(dto.expiresAt),
                dto.revokedAt ? new Date(dto.revokedAt) : null,
                new Date(dto.createdAt),
                new Date(dto.updatedAt),
            );
        } catch {
            await this.safeDel(cacheKey(id));
            return null;
        }
    }

    private async safeGet(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (error) {
            this.logger.warn(`Redis get failed for ${key}: ${(error as Error).message}`);
            return null;
        }
    }

    private async safeSet(key: string, value: string): Promise<void> {
        try {
            await this.redis.set(key, value, 'EX', AUTH_CONFIG.CACHE_TTL_SECONDS);
        } catch (error) {
            this.logger.warn(`Redis set failed for ${key}: ${(error as Error).message}`);
        }
    }

    private async safeDel(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            this.logger.warn(`Redis del failed for ${key}: ${(error as Error).message}`);
        }
    }
}
