import { InfrastructureError } from '../base/infrastructure.error';
import { SharedErrorCodes } from './shared-code.error';

export class ExternalServiceError extends InfrastructureError {
    public readonly code = SharedErrorCodes.EXTERNAL_SERVICE_ERROR;
    constructor(serviceName: string, originalError: unknown) {
        super(`External service «${serviceName}» no response and or no error occurred`, {
            serviceName,
            original: originalError instanceof Error ? originalError.message : originalError,
        });
    }
}
