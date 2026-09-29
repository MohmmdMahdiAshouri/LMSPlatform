import { Injectable } from '@nestjs/common';
import { UserSchoolRoleRepository } from '../../domain/repositories/user-school-role.repository';
import { UserSchoolRole } from '../../domain/entities/user-school-role.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { UserSchoolRoleMapper } from '../mappers/user-school-role.mapper';

@Injectable()
export class PrismaUserSchoolRoleRepository implements UserSchoolRoleRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(userSchoolRole: UserSchoolRole): Promise<void> {
        await this.txHost.tx.userSchoolRole.create({
            data: UserSchoolRoleMapper.toPersistence(userSchoolRole),
        });
    }

    async findByUserIdAndSchoolId(userId: string, schoolId: string): Promise<UserSchoolRole | null> {
        const userSchoolRole = await this.txHost.tx.userSchoolRole.findUnique({
            where: {
                idx_user_school_role_user_school: { userId, schoolId },
            },
        });

        if (!userSchoolRole) return null;

        return UserSchoolRoleMapper.toDomain(userSchoolRole);
    }

    async deleteByUserIdAndSchoolId(userId: string, schoolId: string): Promise<void> {
        await this.txHost.tx.userSchoolRole.delete({
            where: {
                idx_user_school_role_user_school: { userId, schoolId },
            },
        });
    }
}
