import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { Email } from '../value-objects/email.vo';

export class EmailAlreadyVerifiedException extends BusinessRuleViolationException {
    constructor(email: Email) {
        super(AuthErrorCode.EMAIL_ALREADY_VERIFIED, `Email ${email.getValue()} already verified.`, { email });
    }
}
