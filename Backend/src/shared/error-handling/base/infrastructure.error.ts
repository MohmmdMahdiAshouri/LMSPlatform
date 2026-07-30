import { BaseError } from '../base.error';

export abstract class InfrastructureError extends BaseError {
    public readonly layer = 'infrastructure' as const;
}
