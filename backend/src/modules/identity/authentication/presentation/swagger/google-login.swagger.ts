import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GoogleLoginSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Start Google OAuth login',
            description:
                'Redirects the user to the Google consent screen. After consent, Google redirects back to /api/auth/google/callback.',
        }),
        ApiResponse({
            status: 302,
            description: 'Redirect to Google OAuth consent screen.',
        }),
    );
}

export function GoogleCallbackSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'Google OAuth callback',
            description:
                'Handles the Google redirect, registers a new user if the Google account is not linked to any existing account (or logs the existing user in), sets the refresh token cookie, and redirects to the frontend with an accessToken query parameter.',
        }),
        ApiResponse({
            status: 302,
            description: 'Redirect to frontend with accessToken.',
        }),
        ApiResponse({
            status: 401,
            description: 'Google authentication failed or email is not verified.',
        }),
        ApiResponse({
            status: 422,
            description: 'An account with this email already exists (registered with password).',
        }),
    );
}
