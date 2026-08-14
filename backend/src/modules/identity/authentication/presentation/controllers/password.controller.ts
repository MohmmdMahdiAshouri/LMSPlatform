import { Body, Controller, HttpStatus, Patch, Post } from '@nestjs/common';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../../application/commands/password/forgot-password.command';
import { ForgotPasswordSwagger } from '../swagger/forgot-password.swagger';
import { PasswordResetDto } from '../dto/reset-password.dto';
import { ResetPasswordCommand } from '../../application/commands/password/reset-password.command';
import { ResetPasswordSwagger } from '../swagger/reset-password.swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ChangePasswordCommand } from '../../application/commands/password/change-password.command';
import type { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class PasswordController {
    constructor(private readonly commandBus: CommandBus) {}
    @Post('forgot-password')
    @ForgotPasswordSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Password reset token sent.',
    })
    @Public()
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.commandBus.execute(new ForgotPasswordCommand(forgotPasswordDto.email));
    }

    @Post('reset-password')
    @ResetPasswordSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Password has been reset successfully.',
    })
    @Public()
    resetPassword(@Body() resetPasswordDto: PasswordResetDto) {
        return this.commandBus.execute(new ResetPasswordCommand(resetPasswordDto.token, resetPasswordDto.password));
    }

    @Patch('change-password')
    @ApiBearerAuth('access-token')
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Password changed successfully.',
    })
    changePassword(@CurrentUser() user: AuthenticatedUser, @Body() changePasswordDto: ChangePasswordDto) {
        return this.commandBus.execute(
            new ChangePasswordCommand(user.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword),
        );
    }
}
