import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import type { OutboxMessageRepository } from '../application/outbox-message.repository';
import { OutboxMessage } from '../domain/outbox-message.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaOutboxRepository implements OutboxMessageRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(message: OutboxMessage): Promise<void> {
        await this.txHost.tx.outboxMessage.create({
            data: {
                id: message.getId(),
                eventType: message.getEventType(),
                payload: message.getPayload() as Prisma.InputJsonValue,
            },
        });
    }

    async findUnprocessed(limit: number): Promise<OutboxMessage[]> {
        const rows = await this.txHost.tx.outboxMessage.findMany({
            where: { processedAt: null },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });

        return rows.map((row) =>
            OutboxMessage.restore({
                id: row.id,
                eventType: row.eventType,
                payload: row.payload as Record<string, unknown>,
                createdAt: row.createdAt,
                processedAt: row.processedAt,
                attempts: row.attempts,
            }),
        );
    }

    async markProcessed(id: string): Promise<void> {
        await this.txHost.tx.outboxMessage.update({
            where: { id },
            data: { processedAt: new Date() },
        });
    }

    async incrementAttempts(id: string, error: string): Promise<void> {
        await this.txHost.tx.outboxMessage.update({
            where: { id },
            data: { attempts: { increment: 1 }, lastError: error },
        });
    }
}
