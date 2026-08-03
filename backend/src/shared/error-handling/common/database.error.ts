import { InfrastructureError } from '../base/infrastructure.error';
import { SharedErrorCodes } from './shared-code.error';

export class DatabaseError extends InfrastructureError {
    public readonly code = SharedErrorCodes.DATABASE_ERROR;
    constructor(operation: string, originalError: unknown) {
        super(`Database Error while ${operation}`, {
            operation,
            original: originalError instanceof Error ? originalError.message : originalError,
        });
    }
}
