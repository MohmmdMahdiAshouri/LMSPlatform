import { ApplicationError } from '../base/application.error';
import { SharedErrorCodes } from './shared-code.error';

export class ForbiddenError extends ApplicationError {
    public readonly code = SharedErrorCodes.AUTHORIZATION_PERMISSION_DENIED;
    constructor(action: string, resourse: string) {
        super(`You don't have permission to ${action} on ${resourse}`, { action, resourse });
    }
}
