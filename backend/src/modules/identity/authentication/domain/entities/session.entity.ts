import { randomUUID } from 'crypto';
import { SessionStatus, DeviceType } from '../enums/session.enum';

export class Session {
    constructor(
        private readonly id: string,
        private readonly userId: string,
        private status: SessionStatus,
        private deviceType: DeviceType,
        private readonly browser: string,
        private readonly operatingSystem: string,
        private readonly ipAddress: string,
        private readonly userAgent: string,
        private lastActivityAt: Date,
        private expiresAt: Date,
        private revokedAt: Date | null,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        userId: string,
        status: SessionStatus,
        deviceType: DeviceType,
        browser: string,
        operatingSystem: string,
        ipAddress: string,
        userAgent: string,
        lastActivityAt: Date,
        expiresAt: Date,
        revokedAt: Date | null,
        createdAt: Date,
        updatedAt: Date,
    ): Session {
        return new Session(
            id,
            userId,
            status,
            deviceType,
            browser,
            operatingSystem,
            ipAddress,
            userAgent,
            lastActivityAt,
            expiresAt,
            revokedAt,
            createdAt,
            updatedAt,
        );
    }

    static create(
        userId: string,
        deviceType: DeviceType,
        browser: string,
        operatingSystem: string,
        ipAddress: string,
        userAgent: string,
        lastActivityAt: Date,
        expiresAt: Date,
    ): Session {
        return new Session(
            randomUUID(),
            userId,
            SessionStatus.ACTIVE,
            deviceType,
            browser,
            operatingSystem,
            ipAddress,
            userAgent,
            lastActivityAt,
            expiresAt,
            null,
            new Date(),
            new Date(),
        );
    }

    revoke(): void {
        if (this.revokedAt) return;

        this.status = SessionStatus.REVOKED;
        this.revokedAt = new Date();
        this.touch();
    }

    expire(): void {
        if (this.isExpired()) return;

        this.status = SessionStatus.EXPIRED;
        this.touch();
    }

    refreshActivity(lastActivityAt: Date, expiresAt: Date): void {
        this.lastActivityAt = lastActivityAt;
        this.expiresAt = expiresAt;
        this.touch();
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    isActive(): boolean {
        return this.status === SessionStatus.ACTIVE && !this.isExpired() && !this.isRevoked();
    }

    isExpired(): boolean {
        return this.expiresAt.getTime() <= Date.now();
    }

    isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    canRefresh(): boolean {
        return this.isActive() && !this.isExpired() && !this.isRevoked();
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getStatus(): SessionStatus {
        return this.status;
    }

    getDeviceType(): DeviceType {
        return this.deviceType;
    }

    getBrowser(): string {
        return this.browser;
    }

    getOperatingSystem(): string {
        return this.operatingSystem;
    }
    getIpAddress(): string {
        return this.ipAddress;
    }
    getUserAgent(): string {
        return this.userAgent;
    }
    getLastActivityAt(): Date {
        return this.lastActivityAt;
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
    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
