import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY, PERMISSION_REPOSITORY, USER_SCHOOL_ROLE_REPOSITORY } from '../tokens/injection.token';
import type { RoleRepository } from '../../domain/repositories/role.repository';
import type { PermissionRepository } from '../../domain/repositories/permission.repository';
import type { UserSchoolRoleRepository } from '../../domain/repositories/user-school-role.repository';
import { Role } from '../../domain/entities/role.entity';
import { UserSchoolRole } from '../../domain/entities/user-school-role.entity';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { SystemRoleModificationNotAllowedException } from '../../domain/exceptions/system-role-modification-not-allowed.exception';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class AuthorizationService {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: RoleRepository,
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: PermissionRepository,
        @Inject(USER_SCHOOL_ROLE_REPOSITORY)
        private readonly userSchoolRoleRepository: UserSchoolRoleRepository,
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async createOwnerRole(schoolId: string, ownerId: string): Promise<Role> {
        // 1. Create the OWNER system role
        const ownerRole = Role.createSystemRole(schoolId, 'OWNER');
        await this.roleRepository.save(ownerRole);

        // 2. Fetch all platform permissions and attach them to the OWNER role
        const allPermissions = await this.permissionRepository.findAll();

        for (const permission of allPermissions) {
            const rolePermission = RolePermission.create(ownerRole.getId(), permission.getId());
            await this.txHost.tx.rolePermission.create({
                data: {
                    roleId: rolePermission.getRoleId(),
                    permissionId: rolePermission.getPermissionId(),
                },
            });
        }

        // 3. Create UserSchoolRole linking the owner to the OWNER role
        const userSchoolRole = UserSchoolRole.create(ownerId, schoolId, ownerRole.getId());
        await this.userSchoolRoleRepository.save(userSchoolRole);

        return ownerRole;
    }

    assertNotSystemRole(role: Role): void {
        if (role.getIsSystem()) {
            throw new SystemRoleModificationNotAllowedException(role.getName());
        }
    }
}
