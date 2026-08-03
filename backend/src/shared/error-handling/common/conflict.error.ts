import { ApplicationError } from '../base/application.error';

export class ConflictError extends ApplicationError {
    public readonly code: string;
    constructor(code: string, message: string, metadata?: Record<string, unknown>) {
        super(message, metadata);
        this.code = code;
    }
}
