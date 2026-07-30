import { BaseError } from '../base.error';

export abstract class ApplicationError extends BaseError {
    public readonly layer = 'application' as const;
}
