import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class UserLockedException extends BusinessRuleViolationException {
    constructor(readonly lockedUntil: Date | null) {
        super(AuthErrorCode.USER_LOCKED, `User account is locked until ${lockedUntil?.toISOString()}.`);
    }
}
