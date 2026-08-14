import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';

export class SessionIsInvalidOrRevokedException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.SESSION_IS_INVALID_OR_REVOKED, `Session is invalid or revoked`);
    }
}
