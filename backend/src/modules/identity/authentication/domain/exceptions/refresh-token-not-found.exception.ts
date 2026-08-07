import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { NotFoundError } from '@shared/error-handling/common/not-found.error';

export class RefreshTokenNotFoundException extends NotFoundError {
    constructor() {
        super(AuthErrorCode.REFRESH_TOKEN_NOT_FOUND, `Refresh token not found.`);
    }
}
