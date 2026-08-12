import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyEmailSwagger } from '../swagger/verify-email.swagger';
import { Response } from '@shared/response-handling/decorators/response.decorator';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthenticationContextMapper } from '../mappers/authentication-context.mapper';
import { VerifyEmailCommand } from '../../application/commands/verify-email/verify-email.command';
import { ResendVerificationTokenSwagger } from '../swagger/resend-verification-token.swagger';
import { ResendVerificationTokenDto } from '../dto/resend-verification-token.dto';
import { ResendVerificationTokenCommand } from '../../application/commands/verify-email/resend-verification-token.command';

@Controller('auth')
export class VerificationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authenticationContext: AuthenticationContextMapper,
    ) {}

    @Post('verify-email')
    @VerifyEmailSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Email verified successfully',
    })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        await this.commandBus.execute(new VerifyEmailCommand(verifyEmailDto.verificationToken));
    }

    @Post('resend-verification-token')
    @ResendVerificationTokenSwagger()
    @Response({
        statusCode: HttpStatus.OK,
        message: 'Verification token sent successfully',
    })
    resendVerification(@Body() resendVerificationDto: ResendVerificationTokenDto) {
        return this.commandBus.execute(new ResendVerificationTokenCommand(resendVerificationDto.email));
    }
}
