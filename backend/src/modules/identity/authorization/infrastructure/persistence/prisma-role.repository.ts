import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role } from '../../domain/entities/role.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(role: Role): Promise<void> {
        const data = RoleMapper.toPersistence(role);
        await this.txHost.tx.role.create({
            data: {
                id: data.id,
                schoolId: data.schoolId,
                name: data.name,
                isSystem: data.isSystem,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                permissions: {
                    create: data.permissionIds.map((permissionId) => ({
                        permissionId,
                    })),
                },
            },
        });
    }

    async findById(id: string): Promise<Role | null> {
        const role = await this.txHost.tx.role.findUnique({
            where: { id },
        });

        if (!role) return null;

        return RoleMapper.toDomain(role);
    }

    async findBySchoolIdAndName(schoolId: string, name: string): Promise<Role | null> {
        const role = await this.txHost.tx.role.findUnique({
            where: {
                idx_role_school_name: {
                    schoolId,
                    name,
                },
            },
        });

        if (!role) return null;

        return RoleMapper.toDomain(role);
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.role.delete({
            where: { id },
        });
    }
}
