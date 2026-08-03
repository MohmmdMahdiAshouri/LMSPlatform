import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { Email } from '../value-objects/email.vo';

export class EmailAlreadyExistsException extends BusinessRuleViolationException {
    constructor(email: Email) {
        super(AuthErrorCode.EMAIL_ALREADY_EXISTS, `Email ${email.getValue()} already exists.`, { email });
    }
}
