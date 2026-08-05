import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class InvalidPasswordhashException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.INVALID_PASSWORDHASH, `Passwordhash is invalid.`);
    }
}
