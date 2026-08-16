import { UserStatus } from '../../domain/enums/user-status.enum';

export interface CurrentUserType {
    id: string;
    email: string;
    username: string;
    status: UserStatus;
    emailVerified: boolean;
}
