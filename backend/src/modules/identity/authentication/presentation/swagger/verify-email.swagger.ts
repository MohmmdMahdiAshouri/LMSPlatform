import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse, ApiOkResponse } from '@nestjs/swagger';

export function VerifyEmailSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Verify user email',
            description: "Verifies the user's email address using the provided verification token.",
        }),

        ApiResponse({
            status: 422,
            description: 'Business validation failed.',
        }),

        ApiOkResponse({
            description: 'Email verified successfully.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
