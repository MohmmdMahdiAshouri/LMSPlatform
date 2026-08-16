import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function GetCurrentUserSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get current user',
            description: "Get User's data",
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
