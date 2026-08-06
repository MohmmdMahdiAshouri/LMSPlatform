import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { NotFoundError } from '@shared/error-handling/common/not-found.error';

export class UserNotFoundException extends NotFoundError {
    constructor() {
        super(AuthErrorCode.USER_NOT_FOUND, `User not found.`);
    }
}
