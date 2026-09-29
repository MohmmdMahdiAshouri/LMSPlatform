import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { CreateSchoolCommand } from '../../application/commands/create-school.command';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { CurrentUser } from '@shared/common/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/identity/authentication/application/ports/authenticated-user.port';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('school-management')
export class SchoolManagementController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('create')
    @ApiBearerAuth('access-token')
    @Response({
        statusCode: HttpStatus.CREATED,
        message: 'School created successfully',
    })
    async createSchool(@Body() dto: CreateSchoolDto, @CurrentUser() user: AuthenticatedUser) {
        await this.commandBus.execute(new CreateSchoolCommand(user.userId, dto.name));
    }
}
