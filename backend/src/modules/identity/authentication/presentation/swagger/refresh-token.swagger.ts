import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function RefreshTokenSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Rotate refresh token',
            description: 'Generate new refresh, access Tokens',
        }),

        ApiResponse({
            status: 422,
            description: 'Business validation failed.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
