import { UserSchoolRole as PrismaUserSchoolRole } from '@prisma/client';
import { UserSchoolRole } from '../../domain/entities/user-school-role.entity';

export class UserSchoolRoleMapper {
    static toDomain(prisma: PrismaUserSchoolRole): UserSchoolRole {
        return UserSchoolRole.restore(
            prisma.id,
            prisma.userId,
            prisma.schoolId,
            prisma.roleId,
            prisma.createdAt,
            prisma.updatedAt,
        );
    }

    static toPersistence(userSchoolRole: UserSchoolRole) {
        return {
            id: userSchoolRole.getId(),
            userId: userSchoolRole.getUserId(),
            schoolId: userSchoolRole.getSchoolId(),
            roleId: userSchoolRole.getRoleId(),
            createdAt: userSchoolRole.getCreatedAt(),
            updatedAt: userSchoolRole.getUpdatedAt(),
        };
    }
}
