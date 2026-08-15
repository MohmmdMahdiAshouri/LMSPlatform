import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

export function LogoutSpecificDeviceSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Logout Specific Device',
            description: 'Logged out the another device',
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
