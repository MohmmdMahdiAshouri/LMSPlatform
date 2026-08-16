import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { UnauthorizedError } from '@shared/error-handling/common/unauthorized.error';

export class GoogleEmailNotVerifiedException extends UnauthorizedError {
    constructor() {
        super(AuthErrorCode.GOOGLE_EMAIL_NOT_VERIFIED, 'Google account email is not verified.');
    }
}
