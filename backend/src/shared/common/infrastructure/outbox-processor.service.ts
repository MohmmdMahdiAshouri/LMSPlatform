import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import type { OutboxMessageRepository } from '../application/outbox-message.repository';
import { OUTBOX_REPOSITORY } from '../domain/injection.token';
import { OUTBOX_EVENT_FACTORIES, OutboxEventFactory } from '../domain/outbox-event-factory';

@Injectable()
export class OutboxProcessorService {
    private static readonly MAX_ATTEMPTS = 5;
    private readonly logger = new Logger(OutboxProcessorService.name);

    constructor(
        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: OutboxMessageRepository,
        @Inject(OUTBOX_EVENT_FACTORIES)
        private readonly eventFactories: OutboxEventFactory[],
        private readonly eventBus: EventBus,
    ) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    @Transactional()
    async processPendingMessages(): Promise<void> {
        const messages = await this.outboxRepository.findUnprocessed(20);

        for (const message of messages) {
            try {
                const eventFactory = this.eventFactories.find(
                    (factory) => factory.eventType === message.getEventType(),
                );

                if (!eventFactory) {
                    this.logger.warn(
                        `Unknown event type '${message.getEventType()}' — discarding outbox message ${message.getId()}`,
                    );
                    await this.outboxRepository.markProcessed(message.getId());
                    continue;
                }

                this.eventBus.publish(eventFactory.create(message.getPayload()));
                await this.outboxRepository.markProcessed(message.getId());
            } catch (error) {
                await this.outboxRepository.incrementAttempts(message.getId(), (error as Error).message);

                if (message.getAttempts() + 1 >= OutboxProcessorService.MAX_ATTEMPTS) {
                    this.logger.error(`Outbox message ${message.getId()} exceeded max attempts — discarding`, error);
                    await this.outboxRepository.markProcessed(message.getId());
                } else {
                    this.logger.error(`Failed to process outbox message ${message.getId()}`, error);
                }
            }
        }
    }
}
