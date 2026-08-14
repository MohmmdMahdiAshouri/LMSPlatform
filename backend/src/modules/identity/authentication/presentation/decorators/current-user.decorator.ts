import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../application/ports/authenticated-user.port';
interface RequestWithUser extends Request {
    user: AuthenticatedUser;
}
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    return ctx.switchToHttp().getRequest<RequestWithUser>().user;
});
