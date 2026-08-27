import { randomUUID } from 'crypto';
import { ApprovalRequestType } from '../enums/approval-request-type.enum';
import { ApprovalRequestStatus } from '../enums/approval-request-status.enum';

export class ApprovalRequest {
    private constructor(
        private readonly id: string,
        private readonly schoolId: string,
        private readonly requestedBy: string,
        private readonly type: ApprovalRequestType,
        private readonly payload: Record<string, unknown>,
        private status: ApprovalRequestStatus,
        private reviewedBy: string | null,
        private reviewedAt: Date | null,
        private failureReason: string | null,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        schoolId: string,
        requestedBy: string,
        type: ApprovalRequestType,
        payload: Record<string, unknown>,
        status: ApprovalRequestStatus,
        reviewedBy: string | null,
        reviewedAt: Date | null,
        failureReason: string | null,
        createdAt: Date,
        updatedAt: Date,
    ): ApprovalRequest {
        return new ApprovalRequest(
            id,
            schoolId,
            requestedBy,
            type,
            payload,
            status,
            reviewedBy,
            reviewedAt,
            failureReason,
            createdAt,
            updatedAt,
        );
    }

    static create(
        schoolId: string,
        requestedBy: string,
        type: ApprovalRequestType,
        payload: Record<string, unknown>,
    ): ApprovalRequest {
        const now = new Date();
        return new ApprovalRequest(
            randomUUID(),
            schoolId,
            requestedBy,
            type,
            payload,
            ApprovalRequestStatus.PENDING,
            null,
            null,
            null,
            now,
            now,
        );
    }

    approve(reviewerId: string): void {
        this.status = ApprovalRequestStatus.APPROVED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = new Date();
        this.touch();
    }

    reject(reviewerId: string): void {
        this.status = ApprovalRequestStatus.REJECTED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = new Date();
        this.touch();
    }

    markFailed(reason: string): void {
        this.status = ApprovalRequestStatus.FAILED;
        this.failureReason = reason;
        this.touch();
    }

    isPending(): boolean {
        return this.status === ApprovalRequestStatus.PENDING;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    getId(): string {
        return this.id;
    }

    getSchoolId(): string {
        return this.schoolId;
    }

    getRequestedBy(): string {
        return this.requestedBy;
    }

    getType(): ApprovalRequestType {
        return this.type;
    }

    getPayload(): Record<string, unknown> {
        return this.payload;
    }

    getStatus(): ApprovalRequestStatus {
        return this.status;
    }

    getReviewedBy(): string | null {
        return this.reviewedBy;
    }

    getReviewedAt(): Date | null {
        return this.reviewedAt;
    }

    getFailureReason(): string | null {
        return this.failureReason;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
