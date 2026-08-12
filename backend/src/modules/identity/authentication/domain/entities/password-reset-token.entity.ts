import { randomUUID } from 'crypto';
import { NotUsablePasswordResetTokenException } from '../exceptions/not-useble-password-reset-token.exception';

export class PasswordResetToken {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly tokenHash: string,
        private readonly expiresAt: Date,
        private usedAt: Date | null,
        private revokedAt: Date | null,
        private readonly createdAt: Date,
    ) {}

    static restore(
        id: string,
        userId: string,
        tokenHash: string,
        expiresAt: Date,
        usedAt: Date | null,
        revokedAt: Date | null,
        createdAt: Date,
    ): PasswordResetToken {
        return new PasswordResetToken(id, userId, tokenHash, expiresAt, usedAt, revokedAt, createdAt);
    }

    static create(userId: string, tokenHash: string, expiresAt: Date): PasswordResetToken {
        return new PasswordResetToken(randomUUID(), userId, tokenHash, expiresAt, null, null, new Date());
    }

    use(): void {
        if (!this.isUsable()) {
            throw new NotUsablePasswordResetTokenException();
        }
        this.usedAt = new Date();
    }

    revoke(): void {
        if (this.revokedAt) return;

        this.revokedAt = new Date();
    }

    isExpired(): boolean {
        return this.expiresAt.getTime() <= Date.now();
    }

    isUsed(): boolean {
        return this.usedAt !== null;
    }

    isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    isUsable(): boolean {
        return !this.isExpired() && !this.isUsed() && !this.isRevoked();
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getTokenHash(): string {
        return this.tokenHash;
    }

    getExpiresAt(): Date {
        return this.expiresAt;
    }

    getUsedAt(): Date | null {
        return this.usedAt;
    }

    getRevokedAt(): Date | null {
        return this.revokedAt;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
