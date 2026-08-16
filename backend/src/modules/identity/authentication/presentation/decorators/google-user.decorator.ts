import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { GoogleUserProfile } from '../../application/contracts/google-user-profile';

interface RequestWithUser extends Request {
    user: GoogleUserProfile;
}

export const GoogleUser = createParamDecorator((data: unknown, ctx: ExecutionContext): GoogleUserProfile => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
});
