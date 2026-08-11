// src/shared/infrastructure/outbox/outbox-processor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import type { OutboxMessageRepository } from '../application/outbox-message.repository';
import { OUTBOX_REPOSITORY } from '../domain/injection.token';
import { VerificationTokenEvent } from '@modules/identity/authentication/application/events/verification-token.event';

const EVENT_MAP: Record<string, (payload: Record<string, unknown>) => object> = {
    VerificationTokenEvent: (payload) => {
        const p = payload as unknown as VerificationTokenEvent;
        return new VerificationTokenEvent(p.userId, p.email, p.username, p.verificationToken);
    },
};

@Injectable()
export class OutboxProcessorService {
    private readonly logger = new Logger(OutboxProcessorService.name);

    constructor(
        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: OutboxMessageRepository,
        private readonly eventBus: EventBus,
    ) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    @Transactional()
    async processPendingMessages(): Promise<void> {
        const messages = await this.outboxRepository.findUnprocessed(20);

        for (const message of messages) {
            try {
                const eventFactory = EVENT_MAP[message.getEventType()];
                if (!eventFactory) {
                    this.logger.warn(`Unknown event type: ${message.getEventType()}`);
                    continue;
                }

                this.eventBus.publish(eventFactory(message.getPayload()));
                await this.outboxRepository.markProcessed(message.getId());
            } catch (error) {
                await this.outboxRepository.incrementAttempts(message.getId(), (error as Error).message);
                this.logger.error(`Failed to process outbox message ${message.getId()}`, error);
            }
        }
    }
}
