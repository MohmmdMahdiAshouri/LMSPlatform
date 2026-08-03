import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';

export function RegisterSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Register a new user',
            description: 'Creates a new user account and returns the registered user.',
        }),

        ApiResponse({
            status: 422,
            description: 'Business validation failed.',
        }),

        ApiBody({
            type: RegisterDto,
        }),

        ApiCreatedResponse({
            description: 'User registered successfully.',
        }),

        ApiBadRequestResponse({
            description: 'Validation failed.',
        }),
    );
}
