import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../../application/commands/password/forgot-password.command';
import { ForgotPasswordSwagger } from '../swagger/forgot-password.swagger';

@Controller('auth')
export class PasswordController {
    constructor(private readonly commandBus: CommandBus) {}
    @Post('forgot-password')
    @ForgotPasswordSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Password reset token sent',
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.commandBus.execute(new ForgotPasswordCommand(forgotPasswordDto.email));
    }
}
