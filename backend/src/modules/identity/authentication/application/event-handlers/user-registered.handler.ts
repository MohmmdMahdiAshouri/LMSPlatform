import { EventsHandler } from '@nestjs/cqrs';
import { IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { EmailSender } from '@shared/email/smtp-sender.port';
import { EMAIL_SENDER } from '@shared/email/injection.token';
import { VerifyEmailTemplate } from '../../templates/verify-email.template';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
    constructor(
        @Inject(EMAIL_SENDER)
        private readonly emailSender: EmailSender,
    ) {}

    async handle(event: UserRegisteredEvent): Promise<void> {
        const emailContent = VerifyEmailTemplate.generate(event.username, event.verificationToken);
        await this.emailSender.send({
            to: event.email,
            subject: 'Welcome!',
            html: emailContent,
        });
    }
}
