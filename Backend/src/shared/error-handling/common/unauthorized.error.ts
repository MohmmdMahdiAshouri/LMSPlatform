import { ApplicationError } from '../base/application.error';

export class UnauthorizedError extends ApplicationError {
    public readonly code: string;
    constructor(code: string, message = 'Authorization failed') {
        super(message);
        this.code = code;
    }
}
