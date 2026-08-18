import { Controller, Delete, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { LogoutCurrentDeviceSwagger } from '../swagger/logout-current-device.swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { Response as ExpressResponse } from 'express';
import type { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { LogoutCurrentDeviceCommand } from '../../application/commands/session/logout-current-device.command';
import { AuthenticationContextMapper } from '../mappers/authentication-context.mapper';
import { LogoutAllDevicesCommand } from '../../application/commands/session/logout-all-devices.command';
import { LogoutAllDevicesSwagger } from '../swagger/logout-all-devices.swagger';
import { LogoutSpecificDeviceCommand } from '../../application/commands/session/logout-specific-device.command';
import { LogoutSpecificDeviceSwagger } from '../swagger/logout-specific-device.swagger';
import { GetActiveSessionsQuery } from '../../application/queries/sessions/get-active-sessions.query';
import { GetActiveSessionsSwagger } from '../swagger/get-active-sessions.swagger';

@ApiBearerAuth('access-token')
@Controller('auth')
export class SessionController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly authenticationContext: AuthenticationContextMapper,
    ) {}

    @Delete('logout')
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

    @Delete('sessions')
    @LogoutAllDevicesSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'All devices Logged out successfully.',
    })
    async logoutAllDevices(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: ExpressResponse) {
        const result = await this.commandBus.execute<LogoutAllDevicesCommand, void>(
            new LogoutAllDevicesCommand(user.userId),
        );
        this.authenticationContext.clearRefreshTokenCookie(res);
        return result;
    }

    @Delete('sessions/:sessionId')
    @LogoutSpecificDeviceSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Device logged out successfully.',
    })
    logoutSpecificDevice(@CurrentUser() user: AuthenticatedUser, @Param('sessionId') sessionId: string) {
        return this.commandBus.execute(new LogoutSpecificDeviceCommand(user.userId, sessionId));
    }

    @Get('sessions')
    @GetActiveSessionsSwagger()
    @Response({ statusCode: HttpStatus.OK })
    getActiveSessions(@CurrentUser() user: AuthenticatedUser) {
        return this.queryBus.execute(new GetActiveSessionsQuery(user.userId));
    }
}
