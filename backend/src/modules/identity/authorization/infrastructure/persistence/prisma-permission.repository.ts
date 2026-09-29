import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { Permission } from '../../domain/entities/permission.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PermissionMapper } from '../mappers/permission.mapper';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async findAll(): Promise<Permission[]> {
        const permissions = await this.txHost.tx.permission.findMany();
        return permissions.map((permission) => PermissionMapper.toDomain(permission));
    }

    async findById(id: string): Promise<Permission | null> {
        const permission = await this.txHost.tx.permission.findUnique({
            where: { id },
        });

        if (!permission) return null;

        return PermissionMapper.toDomain(permission);
    }
}
