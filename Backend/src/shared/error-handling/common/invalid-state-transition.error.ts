import { DomainError } from '../base/domain.error';

export abstract class InvalidStateTransitionError extends DomainError {
    public readonly code: string;
    constructor(code: string, entityName: string, currentState: string, attemptedState: string) {
        super(`Transitioning «${entityName}» from state «${currentState}» to «${attemptedState}» is not allowed`, {
            entityName,
            currentState,
            attemptedState,
        });
        this.code = code;
    }
}
