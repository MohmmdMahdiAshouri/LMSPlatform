import { Role as PrismaRole } from '@prisma/client';
import { Role } from '../../domain/entities/role.entity';

export interface RolePersistenceData {
    id: string;
    schoolId: string;
    name: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissionIds: string[];
}

export class RoleMapper {
    static toDomain(prisma: PrismaRole): Role {
        return Role.restore(
            prisma.id,
            prisma.schoolId,
            prisma.name,
            prisma.isSystem,
            prisma.createdAt,
            prisma.updatedAt,
        );
    }

    static toPersistence(role: Role): RolePersistenceData {
        return {
            id: role.getId(),
            schoolId: role.getSchoolId(),
            name: role.getName(),
            isSystem: role.getIsSystem(),
            createdAt: role.getCreatedAt(),
            updatedAt: role.getUpdatedAt(),
            permissionIds: [],
        };
    }
}
