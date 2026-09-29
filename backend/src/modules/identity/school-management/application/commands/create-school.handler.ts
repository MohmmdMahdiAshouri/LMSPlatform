import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSchoolCommand } from './create-school.command';
import { Inject } from '@nestjs/common';
import { SCHOOL_REPOSITORY } from '../tokens/injection.token';
import { SchoolRepository } from '../../domain/repository/school.repository';
import { School } from '../../domain/entities/school.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthorizationService } from '@modules/identity/authorization/application/services/authorization.service';

@CommandHandler(CreateSchoolCommand)
export class CreateSchoolHandler implements ICommandHandler<CreateSchoolCommand> {
    constructor(
        @Inject(SCHOOL_REPOSITORY)
        private readonly schoolRepository: SchoolRepository,
        private readonly authorizationService: AuthorizationService,
    ) {}
    @Transactional()
    async execute(command: CreateSchoolCommand): Promise<any> {
        const school = School.create(command.name, command.userId);
        await this.schoolRepository.save(school);

        await this.authorizationService.createOwnerRole(school.getId(), school.getOwnerId());
    }
}
