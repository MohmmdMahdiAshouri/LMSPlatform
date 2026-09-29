import { Permission as PrismaPermission } from '@prisma/client';
import { Permission } from '../../domain/entities/permission.entity';

export class PermissionMapper {
    static toDomain(prisma: PrismaPermission): Permission {
        return Permission.restore(prisma.id, prisma.key, prisma.description, prisma.createdAt);
    }
}
