import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class UserInactiveException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.USER_IN_ACTIVE, `User account is inactive.`);
    }
}
