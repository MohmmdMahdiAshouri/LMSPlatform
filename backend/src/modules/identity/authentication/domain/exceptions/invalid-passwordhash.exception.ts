import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class InvalidPasswordhashException extends BusinessRuleViolationException {
    constructor(passwordhash: string) {
        super(AuthErrorCode.INVALID_EMAIL, `Passwordhash ${passwordhash} is invalid.`, { passwordhash });
    }
}
