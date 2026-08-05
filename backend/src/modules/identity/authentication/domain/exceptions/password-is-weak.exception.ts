import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class PasswordIsWeakException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.PASSWORD_IS_WEAK, `Your password is weak.`);
    }
}
