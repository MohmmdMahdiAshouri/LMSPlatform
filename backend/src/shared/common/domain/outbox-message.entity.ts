export class OutboxMessage {
    private constructor(
        private readonly id: string,
        private readonly eventType: string,
        private readonly payload: Record<string, unknown>,
        private readonly createdAt: Date,
        private processedAt: Date | null,
        private attempts: number,
    ) {}

    static create(eventType: string, payload: Record<string, unknown>): OutboxMessage {
        return new OutboxMessage(crypto.randomUUID(), eventType, payload, new Date(), null, 0);
    }

    static restore(props: {
        id: string;
        eventType: string;
        payload: Record<string, unknown>;
        createdAt: Date;
        processedAt: Date | null;
        attempts: number;
    }): OutboxMessage {
        return new OutboxMessage(
            props.id,
            props.eventType,
            props.payload,
            props.createdAt,
            props.processedAt,
            props.attempts,
        );
    }

    markProcessed(): void {
        this.processedAt = new Date();
    }

    incrementAttempts(): void {
        this.attempts += 1;
    }

    getId(): string {
        return this.id;
    }
    getEventType(): string {
        return this.eventType;
    }
    getPayload(): Record<string, unknown> {
        return this.payload;
    }
    getAttempts(): number {
        return this.attempts;
    }
    isProcessed(): boolean {
        return this.processedAt !== null;
    }
}
