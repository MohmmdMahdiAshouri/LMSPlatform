import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class AccountExistsWithoutGoogleException extends BusinessRuleViolationException {
    constructor(email: string) {
        super(
            AuthErrorCode.ACCOUNT_EXISTS_WITHOUT_GOOGLE,
            `An account with email ${email} already exists. Please sign in with your password.`,
            { email },
        );
    }
}
