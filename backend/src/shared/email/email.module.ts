import { Global, Module } from '@nestjs/common';
import { EMAIL_SENDER } from './injection.token';
import { SmtpEmailSender } from './smtp-email.sender';
import { QueueModule } from '@shared/queue/queue.module';
import { EmailProducer } from '@modules/identity/authentication/application/producers/email.producer';
import { VerificationEmailWorker } from '@modules/identity/authentication/application/worker/verification-email.worker';
import { PasswordResetEmailWorker } from '@modules/identity/authentication/application/worker/password-reset-token.worker';

@Global()
@Module({
    imports: [QueueModule],
    providers: [
        EmailProducer,
        VerificationEmailWorker,
        PasswordResetEmailWorker,
        {
            provide: EMAIL_SENDER,
            useClass: SmtpEmailSender,
        },
    ],
    exports: [EMAIL_SENDER, EmailProducer],
})
export class EmailModule {}
