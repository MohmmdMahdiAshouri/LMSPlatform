import type { OutboxMessage } from '../domain/outbox-message.entity';

export interface OutboxMessageRepository {
    save(message: OutboxMessage): Promise<void>;
    findUnprocessed(limit: number): Promise<OutboxMessage[]>;
    markProcessed(id: string): Promise<void>;
    incrementAttempts(id: string, error: string): Promise<void>;
}
