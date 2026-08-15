import { Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { LogoutCurrentDeviceSwagger } from '../swagger/logout-current-device.swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { Response as ExpressResponse } from 'express';
import type { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { LogoutCurrentDeviceCommand } from '../../application/commands/session/logout-current-device.command';
import { AuthenticationContextMapper } from '../mappers/authentication-context.mapper';

@ApiBearerAuth('access-token')
@Controller('auth')
export class SessionController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authenticationContext: AuthenticationContextMapper,
    ) {}

    @Post('logout')
    @LogoutCurrentDeviceSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Logged out successfully.',
    })
    async logoutCurrentDevice(
        @CurrentUser() user: AuthenticatedUser,
        @Res({ passthrough: true }) res: ExpressResponse,
    ) {
        const result = await this.commandBus.execute<LogoutCurrentDeviceCommand, void>(
            new LogoutCurrentDeviceCommand(user.userId, user.sessionId),
        );
        this.authenticationContext.clearRefreshTokenCookie(res);

        return result;
    }
}
