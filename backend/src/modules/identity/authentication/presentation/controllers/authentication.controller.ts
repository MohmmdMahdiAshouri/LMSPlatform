import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from '../dto/register.dto';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterSwagger } from '../swagger/register.swagger';
import { VerifyEmailCommand } from '../../application/commands/verify-email/verify-email.command';
import { VerifyEmailSwagger } from '../swagger/verify-email.swagger';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly commandBus: CommandBus) {}

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
    VerifyEmail(@Body() verificationTokenDto: VerifyEmailDto) {
        return this.commandBus.execute(new VerifyEmailCommand(verificationTokenDto.verificationToken));
    }
}
