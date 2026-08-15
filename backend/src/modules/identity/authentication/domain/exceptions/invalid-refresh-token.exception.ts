import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export class InvalidRefreshTokenException extends BusinessRuleViolationException {
    constructor() {
        super(AuthErrorCode.INVALID_REFRESH_TOKEN, `Your refresh token is not usable.`);
    }
}
