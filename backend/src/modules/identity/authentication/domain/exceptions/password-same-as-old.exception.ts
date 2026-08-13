import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export class PasswordSameAsOldException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.PASSWORD_SMAE_AS_OLD, 'Your password must be different from the current password');
    }
}
