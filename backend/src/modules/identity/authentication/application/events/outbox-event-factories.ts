import { OutboxEventFactory } from '@shared/common/domain/outbox-event-factory';
import { VerificationTokenEvent } from './verification-token.event';
import { PasswordResetTokenEvent } from './password-reset-token.event';

export const AUTH_OUTBOX_EVENT_FACTORIES: OutboxEventFactory[] = [
    {
        eventType: VerificationTokenEvent.TYPE,
        create: (payload) => {
            const data = payload as unknown as VerificationTokenEvent;
            return new VerificationTokenEvent(data.userId, data.email, data.username, data.verificationToken);
        },
    },
    {
        eventType: PasswordResetTokenEvent.TYPE,
        create: (payload) => {
            const data = payload as unknown as PasswordResetTokenEvent;
            return new PasswordResetTokenEvent(data.email, data.passwordResetToken);
        },
    },
];
