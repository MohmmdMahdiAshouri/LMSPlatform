import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function GetActiveSessionsSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get active sessions',
            description: "Get User's active sessions",
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
