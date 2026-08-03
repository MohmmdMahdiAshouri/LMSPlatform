import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class InvalidUsernameException extends BusinessRuleViolationException {
    constructor(username: string) {
        super(AuthErrorCode.INVALID_USERNAME, `Username ${username} is invalid.`, { username });
    }
}
