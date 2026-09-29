import { Module } from '@nestjs/common';
import { SchoolManagementController } from './presentation/controllers/school.controller';
import { CreateSchoolHandler } from './application/commands/create-school.handler';
import { SCHOOL_REPOSITORY } from './application/tokens/injection.token';
import { PrismaSchoolRepository } from './infrastructure/persistence/prisma-school.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
    imports: [CqrsModule, AuthorizationModule],
    controllers: [SchoolManagementController],
    providers: [CreateSchoolHandler, { provide: SCHOOL_REPOSITORY, useClass: PrismaSchoolRepository }],
})
export class SchoolManagementModule {}
