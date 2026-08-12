import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class PasswordResetTokenTooSoonException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.PASSWORD_RESET_TOKEN_TOO_SOON, `Your password reset token request too soon.`);
    }
}
