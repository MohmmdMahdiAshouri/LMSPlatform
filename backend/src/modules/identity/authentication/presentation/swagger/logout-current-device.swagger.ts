import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function LogoutCurrentDeviceSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Logout Current Device',
            description: 'Logged out the same device',
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
