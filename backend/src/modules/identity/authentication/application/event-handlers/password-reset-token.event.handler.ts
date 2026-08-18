import { EventsHandler } from '@nestjs/cqrs';
import { IEventHandler } from '@nestjs/cqrs';
import { PasswordResetTokenEvent } from '../events/password-reset-token.event';
import { EmailProducer } from '../ports/email-producer.port';
import { Inject } from '@nestjs/common';
import { EMAIL_PRODUCER } from '../tokens/injection.token';

@EventsHandler(PasswordResetTokenEvent)
export class PasswordResetTokenEventHandler implements IEventHandler<PasswordResetTokenEvent> {
    constructor(
        @Inject(EMAIL_PRODUCER)
        private readonly emailProducer: EmailProducer,
    ) {}

    async handle(event: PasswordResetTokenEvent): Promise<void> {
        await this.emailProducer.sendPasswordResetEmail(event.email, event.passwordResetToken);
    }
}
