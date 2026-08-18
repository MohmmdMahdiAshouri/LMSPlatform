import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { UnauthorizedError } from '@shared/error-handling/common/unauthorized.error';

export class InvalidCredentialsException extends UnauthorizedError {
    constructor() {
        super(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email/username or password.');
    }
}
