import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { UnauthorizedError } from '@shared/error-handling/common/unauthorized.error';

export class PasswordLoginNotAvailableException extends UnauthorizedError {
    constructor() {
        super(
            AuthErrorCode.PASSWORD_LOGIN_NOT_AVAILABLE,
            'This account was created with Google. Please sign in with Google.',
        );
    }
}
