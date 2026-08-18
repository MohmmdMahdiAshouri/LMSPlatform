import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class UserLockedException extends BusinessRuleViolationException {
    constructor(lockedUntil: Date | null) {
        super(AuthErrorCode.USER_LOCKED, 'User account is locked.', {
            lockedUntil: lockedUntil?.toISOString() ?? null,
        });
    }
}
