export const OUTBOX_EVENT_FACTORIES = Symbol('OUTBOX_EVENT_FACTORIES');

export interface OutboxEventFactory {
    eventType: string;
    create(payload: Record<string, unknown>): object;
}
