import { BaseError } from '../base.error';

export abstract class DomainError extends BaseError {
    public readonly layer = 'domain' as const;
}
