import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class InvalidEmailException extends BusinessRuleViolationException {
    constructor(email: string) {
        super(AuthErrorCode.INVALID_EMAIL, `Email ${email} is invalid.`, { email });
    }
}
