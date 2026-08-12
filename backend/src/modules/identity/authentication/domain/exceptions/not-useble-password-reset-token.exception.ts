import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export class NotUsablePasswordResetTokenException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.NOT_USABLE_PASSWORD_RESET_TOKEN, `Your password reset token is not usable.`);
    }
}
