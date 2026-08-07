import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class PasswordIsIncorrectException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.PASSWROD_IS_INCORRECT, `Your password is incorrect.`);
    }
}
