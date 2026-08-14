import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyEmailSwagger } from '../swagger/verify-email.swagger';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyEmailCommand } from '../../application/commands/verify-email/verify-email.command';
import { ResendVerificationTokenSwagger } from '../swagger/resend-verification-token.swagger';
import { ResendVerificationTokenCommand } from '../../application/commands/verify-email/resend-verification-token.command';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { Public } from '../decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('auth')
export class VerificationController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('verify-email')
    @VerifyEmailSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Email verified successfully',
    })
    @Public()
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        await this.commandBus.execute(new VerifyEmailCommand(verifyEmailDto.verificationToken));
    }

    @Post('resend-verification-token')
    @ResendVerificationTokenSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Verification token sent successfully',
    })
    @ApiBearerAuth('access-token')
    resendVerification(@CurrentUser() user: AuthenticatedUser) {
        return this.commandBus.execute(new ResendVerificationTokenCommand(user.userId));
    }
}
