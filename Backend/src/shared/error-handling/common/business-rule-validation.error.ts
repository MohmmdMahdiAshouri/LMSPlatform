import { DomainError } from '../base/domain.error';

export abstract class BusinessRuleViolationException extends DomainError {
    public readonly code: string;
    constructor(code: string, message: string, metadata?: Record<string, unknown>) {
        super(message, metadata);
        this.code = code;
    }
}
