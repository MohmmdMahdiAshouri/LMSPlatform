import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from '../dto/register.dto';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterSwagger } from '../swagger/register.swagger';
import { VerifyEmailCommand } from '../../application/commands/verify-email/verify-email.command';
import { VerifyEmailSwagger } from '../swagger/verify-email.swagger';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthenticationResult } from '../../application/contracts/authentication-result';
import { AuthenticationContextMapper } from '../mappers/authentication-context.mapper';
import { LoginDto } from '../dto/Login.dto';
import { LoginCommand } from '../../application/commands/login/login.command';
import { LoginSwagger } from '../swagger/login.swagger';
import { ResendVerificationTokenDto } from '../dto/resend-verification-token.dto';
import { ResendVerificationTokenCommand } from '../../application/commands/verify-email/resend-verification-token.command';
import { ResendVerificationToken } from '../swagger/resend-verification-token.swagger';

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
        message: 'User registered successfully',
    })
    register(@Body() registerDto: RegisterDto) {
        return this.commandBus.execute(
            new RegisterCommand(registerDto.email, registerDto.username, registerDto.password),
        );
    }

    @Post('verify-email')
    @VerifyEmailSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Email verified successfully',
    })
    async verifyEmail(
        @Body() verifyEmailDto: VerifyEmailDto,
        @Req() req: ExpressRequest,
        @Res({ passthrough: true }) res: ExpressResponse,
    ) {
        const reqContext = this.authenticationContext.formRequest(req);
        const result = await this.commandBus.execute<VerifyEmailCommand, AuthenticationResult>(
            new VerifyEmailCommand(verifyEmailDto.verificationToken, reqContext),
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

    @Post('resend-verification-token')
    @ResendVerificationToken()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Verification token sent successfully',
    })
    resendVerification(@Body() resendVerificationDto: ResendVerificationTokenDto) {
        return this.commandBus.execute(
            new ResendVerificationTokenCommand(resendVerificationDto.email, resendVerificationDto.username),
        );
    }
}
