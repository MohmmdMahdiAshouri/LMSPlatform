import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { UserStatus } from '../enums/user-status.enum';

export class User {
    private static readonly MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static readonly LOCK_DURATION_MINUTES = 30;
    private constructor(
        private readonly id: string,
        private email: Email,
        private username: Username,
        private passwordHash: PasswordHash | null,
        private readonly googleId: string | null,
        private avatarUrl: string | null,
        private emailVerifiedAt: Date | null,
        private status: UserStatus,
        private failedLoginAttempts: number,
        private lockedUntil: Date | null,
        private lastLoginAt: Date | null,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        email: Email,
        username: Username,
        passwordHash: PasswordHash | null,
        googleId: string | null,
        avatarUrl: string | null,
        emailVerifiedAt: Date | null,
        status: UserStatus,
        failedLoginAttempts: number,
        lockedUntil: Date | null,
        lastLoginAt: Date | null,
        createdAt: Date,
        updatedAt: Date,
    ): User {
        return new User(
            id,
            email,
            username,
            passwordHash,
            googleId,
            avatarUrl,
            emailVerifiedAt,
            status,
            failedLoginAttempts,
            lockedUntil,
            lastLoginAt,
            createdAt,
            updatedAt,
        );
    }

    static register(email: Email, username: Username, passwordHash: PasswordHash): User {
        const now = new Date();

        return new User(
            randomUUID(),
            email,
            username,
            passwordHash,
            null,
            null,
            null,
            UserStatus.ACTIVE,
            0,
            null,
            now,
            now,
            now,
        );
    }

    static registerWithGoogle(email: Email, username: Username, googleId: string, avatarUrl: string | null): User {
        const now = new Date();

        return new User(
            randomUUID(),
            email,
            username,
            null,
            googleId,
            avatarUrl,
            now,
            UserStatus.ACTIVE,
            0,
            null,
            null,
            now,
            now,
        );
    }

    verifyEmail(): void {
        if (this.emailVerifiedAt) return;

        this.emailVerifiedAt = new Date();
        this.touch();
    }

    changePassword(hash: PasswordHash): void {
        this.passwordHash = hash;
        this.touch();
    }

    recordSuccessfulLogin(): void {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
        this.lastLoginAt = new Date();

        this.touch();
    }

    recordFailedLogin(maxAttempts = User.MAX_FAILED_LOGIN_ATTEMPTS): void {
        this.failedLoginAttempts++;

        if (this.failedLoginAttempts >= maxAttempts) {
            this.lockedUntil = new Date(Date.now() + User.LOCK_DURATION_MINUTES * 60 * 1000);
        }

        this.touch();
    }

    lock(until: Date): void {
        this.lockedUntil = until;
        this.touch();
    }

    unlock(): void {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;

        this.touch();
    }

    suspend(): void {
        this.status = UserStatus.SUSPENDED;
        this.touch();
    }

    activate(): void {
        this.status = UserStatus.ACTIVE;
        this.touch();
    }

    ban(): void {
        this.status = UserStatus.BANNED;
        this.touch();
    }

    markAsDeleted(): void {
        this.status = UserStatus.DELETED;
        this.touch();
    }

    isLocked(): boolean {
        return !!this.lockedUntil && this.lockedUntil.getTime() > Date.now();
    }

    isEmailVerified(): boolean {
        return this.emailVerifiedAt !== null;
    }

    isActive(): boolean {
        return this.status === UserStatus.ACTIVE;
    }

    hasPassword(): boolean {
        return this.passwordHash !== null;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    // getters

    getId(): string {
        return this.id;
    }

    getEmail(): Email {
        return this.email;
    }

    getUsername(): Username {
        return this.username;
    }

    getPasswordHash(): PasswordHash | null {
        return this.passwordHash;
    }

    getGoogleId(): string | null {
        return this.googleId;
    }

    getAvatarUrl(): string | null {
        return this.avatarUrl;
    }

    getStatus(): UserStatus {
        return this.status;
    }

    getEmailVerifiedAt(): Date | null {
        return this.emailVerifiedAt;
    }

    getFailedLoginAttempts(): number {
        return this.failedLoginAttempts;
    }

    getLockedUntil(): Date | null {
        return this.lockedUntil;
    }

    getLastLoginAt(): Date | null {
        return this.lastLoginAt;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
