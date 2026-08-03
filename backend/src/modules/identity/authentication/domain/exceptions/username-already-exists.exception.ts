import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { BusinessRuleViolationException } from '@shared/error-handling/common/business-rule-validation.error';
import { Username } from '../value-objects/username.vo';

export class UsernameAlreadyExistsException extends BusinessRuleViolationException {
    constructor(username: Username) {
        super(AuthErrorCode.USERNAME_ALREADY_EXISTS, `Username ${username.getValue()} already exists.`);
    }
}
