// infrastructure/persistence/cached-user.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Username } from '../../domain/value-objects/username.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { REDIS_CLIENT } from '@shared/redis/redis.module';
import { PrismaUserRepository } from './prisma-user.repository';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SerializedUserDto } from './dto/serialized-user.dto';

const USER_CACHE_TTL_SECONDS = 60 * 15;
const cacheKey = (userId: string) => `user:${userId}`;

@Injectable()
export class CachedUserRepository implements UserRepository {
    constructor(
        private readonly prismaUserRepository: PrismaUserRepository,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) {}

    async findById(id: string): Promise<User | null> {
        const cached = await this.redis.get(cacheKey(id));
        if (cached) {
            const user = await this.tryDeserialize(cached, id);
            if (user) return user;
        }

        const user = await this.prismaUserRepository.findById(id);
        if (!user) return null;

        await this.redis.set(cacheKey(id), this.serialize(user), 'EX', USER_CACHE_TTL_SECONDS);
        return user;
    }

    async save(user: User): Promise<void> {
        await this.prismaUserRepository.save(user);
    }

    async update(user: User): Promise<void> {
        await this.prismaUserRepository.update(user);
        await this.redis.del(cacheKey(user.getId()));
    }

    async delete(id: string): Promise<void> {
        await this.prismaUserRepository.delete(id);
        await this.redis.del(cacheKey(id));
    }

    async findByEmail(email: Email): Promise<User | null> {
        return this.prismaUserRepository.findByEmail(email);
    }

    async findByUsername(username: Username): Promise<User | null> {
        return this.prismaUserRepository.findByUsername(username);
    }

    async findByLoginIdentifier(identifier: string): Promise<User | null> {
        return this.prismaUserRepository.findByLoginIdentifier(identifier);
    }

    async existsByEmail(email: Email): Promise<boolean> {
        return this.prismaUserRepository.existsByEmail(email);
    }

    async existsByUsername(username: Username): Promise<boolean> {
        return this.prismaUserRepository.existsByUsername(username);
    }

    private serialize(user: User): string {
        const data: SerializedUserDto = {
            id: user.getId(),
            email: user.getEmail().getValue(),
            username: user.getUsername().getValue(),
            passwordHash: user.getPasswordHash().getValue(),
            emailVerifiedAt: user.getEmailVerifiedAt()?.toISOString() ?? null,
            status: user.getStatus(),
            failedLoginAttempts: user.getFailedLoginAttempts(),
            lockedUntil: user.getLockedUntil()?.toISOString() ?? null,
            lastLoginAt: user.getLastLoginAt()?.toISOString() ?? null,
            createdAt: user.getCreatedAt().toISOString(),
            updatedAt: user.getUpdatedAt().toISOString(),
        };
        return JSON.stringify(data);
    }

    private async tryDeserialize(raw: string, id: string): Promise<User | null> {
        try {
            const parsed: unknown = JSON.parse(raw);
            const dto = plainToInstance(SerializedUserDto, parsed);
            const errors = validateSync(dto);

            if (errors.length > 0) {
                await this.redis.del(cacheKey(id));
                return null;
            }

            return User.restore(
                dto.id,
                Email.create(dto.email),
                Username.create(dto.username),
                PasswordHash.create(dto.passwordHash),
                dto.emailVerifiedAt ? new Date(dto.emailVerifiedAt) : null,
                dto.status,
                dto.failedLoginAttempts,
                dto.lockedUntil ? new Date(dto.lockedUntil) : null,
                dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
                new Date(dto.createdAt),
                new Date(dto.updatedAt),
            );
        } catch {
            await this.redis.del(cacheKey(id));
            return null;
        }
    }
}
