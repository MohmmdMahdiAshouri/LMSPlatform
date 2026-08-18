import { EventsHandler } from '@nestjs/cqrs';
import { IEventHandler } from '@nestjs/cqrs';
import { VerificationTokenEvent } from '../events/verification-token.event';
import { EmailProducer } from '../ports/email-producer.port';
import { Inject } from '@nestjs/common';
import { EMAIL_PRODUCER } from '../tokens/injection.token';

@EventsHandler(VerificationTokenEvent)
export class VerificationTokenEventHandler implements IEventHandler<VerificationTokenEvent> {
    constructor(
        @Inject(EMAIL_PRODUCER)
        private readonly emailProducer: EmailProducer,
    ) {}

    async handle(event: VerificationTokenEvent): Promise<void> {
        await this.emailProducer.sendVerificationEmail(event.email, event.username, event.verificationToken);
    }
}
