import { EventsHandler } from '@nestjs/cqrs';
import { IEventHandler } from '@nestjs/cqrs';
import { VerificationTokenEvent } from '../events/verification-token.event';
import { EmailProducer } from '../producers/email.producer';

@EventsHandler(VerificationTokenEvent)
export class UserRegisteredEventHandler implements IEventHandler<VerificationTokenEvent> {
    constructor(private readonly emailProducer: EmailProducer) {}

    async handle(event: VerificationTokenEvent): Promise<void> {
        await this.emailProducer.sendVerificationEmail(event.email, event.username, event.verificationToken);
    }
}
