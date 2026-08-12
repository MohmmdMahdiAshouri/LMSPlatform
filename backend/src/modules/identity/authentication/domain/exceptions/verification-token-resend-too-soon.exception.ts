import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class VerificationTokenResendTooSoonException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.VERIFICATION_TOKEN_RESEND_TOO_SOON, `Your resend verification token request too soon.`);
    }
}
