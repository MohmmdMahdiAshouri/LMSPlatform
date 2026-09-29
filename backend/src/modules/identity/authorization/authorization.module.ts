import { Module } from '@nestjs/common';
import { AuthorizationService } from './application/services/authorization.service';
// import { SchoolService } from './application/services/school.service';
import {
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    USER_SCHOOL_ROLE_REPOSITORY,
} from './application/tokens/injection.token';
import { PrismaRoleRepository } from './infrastructure/persistence/prisma-role.repository';
import { PrismaPermissionRepository } from './infrastructure/persistence/prisma-permission.repository';
import { PrismaUserSchoolRoleRepository } from './infrastructure/persistence/prisma-user-school-role.repository';

@Module({
    providers: [
        AuthorizationService,
        { provide: ROLE_REPOSITORY, useClass: PrismaRoleRepository },
        { provide: PERMISSION_REPOSITORY, useClass: PrismaPermissionRepository },
        { provide: USER_SCHOOL_ROLE_REPOSITORY, useClass: PrismaUserSchoolRoleRepository },
    ],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}
