import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from '../dto/register.dto';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterSwagger } from '../swagger/register.swagger';

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
}
