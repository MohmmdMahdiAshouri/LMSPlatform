import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
import { Request } from 'express';

interface RequestWithUser extends Request {
    user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly cls: ClsService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const result = (await super.canActivate(context)) as boolean;

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        if (result && request.user) {
            this.cls.set('userId', request.user.userId);
            this.cls.set('sessionId', request.user.sessionId);
        }
        return result;
    }
}
