import { ApplicationError } from '../base/application.error';
import { SharedErrorCodes } from './shared-code.error';

export class NotFoundError extends ApplicationError {
    public readonly code: string;
    constructor(resource: string, identifier: string | number) {
        super(`${resource} this didn't find with ${identifier}`, { resource, identifier });
        this.code = SharedErrorCodes.RESOURCE_NOT_FOUND;
    }
}
