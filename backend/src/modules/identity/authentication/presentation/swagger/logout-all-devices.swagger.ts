import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function LogoutAllDevicesSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Logout all devices',
            description: 'Logged out all device from the each user',
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
