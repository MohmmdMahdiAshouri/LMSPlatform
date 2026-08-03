import { EventsHandler } from '@nestjs/cqrs';
import { IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { EmailProducer } from '../producers/email.producer';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
    constructor(private readonly emailProducer: EmailProducer) {}

    async handle(event: UserRegisteredEvent): Promise<void> {
        await this.emailProducer.sendVerificationEmail(event.email, event.username, event.verificationToken);
    }
}
