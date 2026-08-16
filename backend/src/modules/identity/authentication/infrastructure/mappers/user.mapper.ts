import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Username } from '../../domain/value-objects/username.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { UserStatusMapper } from './user-status.mapper';

export class UserMapper {
    static toDomain(prisma: PrismaUser): User {
        return User.restore(
            prisma.id,
            Email.create(prisma.email),
            Username.create(prisma.username),
            prisma.passwordHash ? PasswordHash.create(prisma.passwordHash) : null,
            prisma.googleId,
            prisma.avatarUrl,
            prisma.emailVerifiedAt,
            UserStatusMapper.toDomain(prisma.status),
            prisma.failedLoginAttempts,
            prisma.lockedUntil,
            prisma.lastLoginAt,
            prisma.createdAt,
            prisma.updatedAt,
        );
    }

    static toPersistence(user: User) {
        return {
            id: user.getId(),
            email: user.getEmail().getValue(),
            username: user.getUsername().getValue(),
            passwordHash: user.getPasswordHash()?.getValue() ?? null,
            googleId: user.getGoogleId(),
            avatarUrl: user.getAvatarUrl(),
            emailVerifiedAt: user.getEmailVerifiedAt(),
            status: UserStatusMapper.toPersistence(user.getStatus()),
            failedLoginAttempts: user.getFailedLoginAttempts(),
            lockedUntil: user.getLockedUntil(),
            lastLoginAt: user.getLastLoginAt(),
            createdAt: user.getCreatedAt(),
            updatedAt: user.getUpdatedAt(),
        };
    }
}
