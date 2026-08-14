import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from '../dto/register.dto';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterSwagger } from '../swagger/register.swagger';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthenticationResult } from '../../application/contracts/authentication-result';
import { AuthenticationContextMapper } from '../mappers/authentication-context.mapper';
import { LoginDto } from '../dto/Login.dto';
import { LoginCommand } from '../../application/commands/login/login.command';
import { LoginSwagger } from '../swagger/login.swagger';
import { Public } from '../decorators/public.decorator';
@Public()
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authenticationContext: AuthenticationContextMapper,
    ) {}

    @Post('register')
    @RegisterSwagger()
    @Response({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully.',
    })
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: ExpressRequest,
        @Res({ passthrough: true }) res: ExpressResponse,
    ) {
        const reqContext = this.authenticationContext.formRequest(req);
        const result = await this.commandBus.execute<RegisterCommand, AuthenticationResult>(
            new RegisterCommand(registerDto.email, registerDto.username, registerDto.password, reqContext),
        );
        this.authenticationContext.formResponse(res, result.refreshToken);
        return { accessToken: result.accessToken };
    }

    @Post('login')
    @LoginSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'User logged in successfully',
    })
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: ExpressRequest,
        @Res({ passthrough: true }) res: ExpressResponse,
    ) {
        const reqContext = this.authenticationContext.formRequest(req);
        const result = await this.commandBus.execute<LoginCommand, AuthenticationResult>(
            new LoginCommand(loginDto.emailOrUsername, loginDto.password, reqContext),
        );
        this.authenticationContext.formResponse(res, result.refreshToken);
        return { accessToken: result.accessToken };
    }
}
