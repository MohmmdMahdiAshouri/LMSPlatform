import { UserStatus as PrismaUserStatus } from '@prisma/client';
import { UserStatus } from '../../domain/enums/user-status.enum';

export class UserStatusMapper {
    static toDomain(status: PrismaUserStatus): UserStatus {
        switch (status) {
            case PrismaUserStatus.ACTIVE:
                return UserStatus.ACTIVE;
            case PrismaUserStatus.SUSPENDED:
                return UserStatus.SUSPENDED;
            case PrismaUserStatus.BANNED:
                return UserStatus.BANNED;
            case PrismaUserStatus.DELETED:
                return UserStatus.DELETED;
        }
    }

    static toPersistence(status: UserStatus): PrismaUserStatus {
        switch (status) {
            case UserStatus.ACTIVE:
                return PrismaUserStatus.ACTIVE;
            case UserStatus.SUSPENDED:
                return PrismaUserStatus.SUSPENDED;
            case UserStatus.BANNED:
                return PrismaUserStatus.BANNED;
            case UserStatus.DELETED:
                return PrismaUserStatus.DELETED;
        }
    }
}
