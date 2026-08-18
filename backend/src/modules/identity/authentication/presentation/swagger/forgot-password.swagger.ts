import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

export function ForgotPasswordSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Forgot Password',
            description: 'Sent password recovery',
        }),

        ApiBody({
            type: ForgotPasswordDto,
        }),

        ApiCreatedResponse({
            description: 'Password reset email sent successfully.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
