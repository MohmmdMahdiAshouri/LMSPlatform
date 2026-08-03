import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class PasswordIsWeakException extends BusinessRuleViolationException {
    constructor(password: string) {
        super(AuthErrorCode.INVALID_EMAIL, `Password ${password} is weak.`, { password });
    }
}
