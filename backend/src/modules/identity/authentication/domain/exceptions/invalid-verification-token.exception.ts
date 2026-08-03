import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export class NotUsableVerificationTokenException extends BusinessRuleViolationException {
    constructor(token: string) {
        super(AuthErrorCode.NOT_USABLE_VERIFICATION_TOKEN, `Verification token ${token} is not usable.`, { token });
    }
}
