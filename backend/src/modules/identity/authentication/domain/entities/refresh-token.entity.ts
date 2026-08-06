import { randomUUID } from 'crypto';

export class RefreshToken {
    private constructor(
        private readonly id: string,
        private readonly sessionId: string,
        private tokenHash: string,
        private expiresAt: Date,
        private revokedAt: Date | null,
        private readonly createdAt: Date,
    ) {}

    static restore(
        id: string,
        sessionId: string,
        tokenHash: string,
        expiresAt: Date,
        revokedAt: Date | null,
        createdAt: Date,
    ): RefreshToken {
        return new RefreshToken(id, sessionId, tokenHash, expiresAt, revokedAt, createdAt);
    }

    static create(sessionId: string, tokenHash: string, expiresAt: Date): RefreshToken {
        return new RefreshToken(randomUUID(), sessionId, tokenHash, expiresAt, null, new Date());
    }

    revoke(): void {
        if (this.revokedAt) return;

        this.revokedAt = new Date();
    }

    rotate(newTokenHash: string, newExpiresAt: Date): void {
        this.tokenHash = newTokenHash;
        this.expiresAt = newExpiresAt;
    }

    isExpired(): boolean {
        return this.expiresAt.getTime() <= Date.now();
    }

    isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    isValid(): boolean {
        return !this.isExpired() && !this.isRevoked();
    }

    getId(): string {
        return this.id;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getTokenHash(): string {
        return this.tokenHash;
    }

    getExpiresAt(): Date {
        return this.expiresAt;
    }

    getRevokedAt(): Date | null {
        return this.revokedAt;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
