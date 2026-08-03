import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/prisma/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Username } from '../../domain/value-objects/username.vo';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(user: User): Promise<void> {
        await this.prisma.user.create({
            data: UserMapper.toPersistence(user),
        });
    }

    async update(user: User): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: user.getId(),
            },
            data: UserMapper.toPersistence(user),
        });
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async findByEmail(email: Email): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email.getValue(),
            },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async findByUsername(username: Username): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username.getValue(),
            },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async existsByEmail(email: Email): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                email: email.getValue(),
            },
        });

        return count > 0;
    }

    async existsByUsername(username: Username): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                username: username.getValue(),
            },
        });

        return count > 0;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }
}
