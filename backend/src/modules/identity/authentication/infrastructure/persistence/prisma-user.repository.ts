import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Username } from '../../domain/value-objects/username.vo';
import { UserMapper } from '../mappers/user.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(user: User): Promise<void> {
        await this.txHost.tx.user.create({
            data: UserMapper.toPersistence(user),
        });
    }

    async update(user: User): Promise<void> {
        await this.txHost.tx.user.update({
            where: {
                id: user.getId(),
            },
            data: UserMapper.toPersistence(user),
        });
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.txHost.tx.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async findByEmail(email: Email): Promise<User | null> {
        const user = await this.txHost.tx.user.findUnique({
            where: {
                email: email.getValue(),
            },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async findByLoginIdentifier(identifier: string): Promise<User | null> {
        const user = await this.txHost.tx.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }

    async existsByEmail(email: Email): Promise<boolean> {
        const count = await this.txHost.tx.user.count({
            where: {
                email: email.getValue(),
            },
        });

        return count > 0;
    }

    async existsByUsername(username: Username): Promise<boolean> {
        const count = await this.txHost.tx.user.count({
            where: {
                username: username.getValue(),
            },
        });

        return count > 0;
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.user.delete({
            where: { id },
        });
    }
}
