import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { PasswordResetDto } from '../dto/reset-password.dto';

export function ResetPasswordSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Password Reset',
            description: 'Confirm new password',
        }),

        ApiResponse({
            status: 404,
            description: 'Not found.',
        }),

        ApiBody({
            type: PasswordResetDto,
        }),

        ApiCreatedResponse({
            description: 'Password has been reset successfully.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
