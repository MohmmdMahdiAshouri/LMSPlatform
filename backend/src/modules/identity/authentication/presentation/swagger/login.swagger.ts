import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/Login.dto';

export function LoginSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Login a user',
            description: 'Logining a registered user',
        }),

        ApiResponse({
            status: 422,
            description: 'Business validation failed.',
        }),

        ApiBody({
            type: LoginDto,
        }),

        ApiCreatedResponse({
            description: 'User logged in successfully.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
