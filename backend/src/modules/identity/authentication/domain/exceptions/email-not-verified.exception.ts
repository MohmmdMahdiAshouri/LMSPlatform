import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class EmailNotVerifiedException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.EMAIL_NOT_VERIFIED, `Email not verified yet.`);
    }
}
