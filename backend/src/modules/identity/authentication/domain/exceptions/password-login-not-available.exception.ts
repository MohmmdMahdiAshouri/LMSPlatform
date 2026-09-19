import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export class PasswordLoginNotAvailableException extends BusinessRuleViolationException {
    constructor() {
        super(
            AuthErrorCode.PASSWORD_LOGIN_NOT_AVAILABLE,
            'This account was created with Google. Please sign in with Google.',
        );
    }
}
