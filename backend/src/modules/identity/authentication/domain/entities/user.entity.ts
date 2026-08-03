import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { UserStatus } from '../enums/user-status.enum';

export class User {
    private constructor(
        private readonly id: string,
        private email: Email,
        private username: Username,
        private passwordHash: PasswordHash,
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
        passwordHash: PasswordHash,
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

        return new User(randomUUID(), email, username, passwordHash, null, UserStatus.ACTIVE, 0, null, null, now, now);
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

    recordFailedLogin(maxAttempts = 5): void {
        this.failedLoginAttempts++;

        if (this.failedLoginAttempts >= maxAttempts) {
            this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
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

    canLogin(): boolean {
        return this.isActive() && !this.isLocked() && this.isEmailVerified();
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

    getPasswordHash(): PasswordHash {
        return this.passwordHash;
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
