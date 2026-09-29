import { DomainError } from '@shared/error-handling/base/domain.error';

export const AUTH_ERROR_CODES = {
    SYSTEM_ROLE_MODIFICATION_NOT_ALLOWED: 'AUTH_SYSTEM_ROLE_MODIFICATION_NOT_ALLOWED',
} as const;

export class SystemRoleModificationNotAllowedException extends DomainError {
    public readonly code = AUTH_ERROR_CODES.SYSTEM_ROLE_MODIFICATION_NOT_ALLOWED;

    constructor(roleName: string) {
        super(`The system role "${roleName}" cannot be modified or deleted.`);
    }
}
