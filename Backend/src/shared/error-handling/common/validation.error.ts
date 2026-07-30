import { ApplicationError } from '../base/application.error';
import { SharedErrorCodes } from './shared-code.error';

export class ValidationError extends ApplicationError {
    public readonly code = SharedErrorCodes.VALIDATION_FAILED;
    constructor(public readonly fieldErrors: Array<{ field: string; message: string }>) {
        super(`Invalid validation`, { fieldErrors });
    }
}
