import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export const RefreshTokenCookie = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
        throw new UnauthorizedException('Refresh token cookie is missing.');
    }

    return token;
});
