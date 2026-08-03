import { Global, Module } from '@nestjs/common';
import { EMAIL_SENDER } from './injection.token';
import { SmtpEmailSender } from './smtp-email.sender';
import { QueueModule } from '@shared/queue/queue.module';
import { EmailProducer } from '@modules/identity/authentication/application/producers/email.producer';
import { EmailWorker } from '@modules/identity/authentication/application/worker/verification-email.worker';

@Global()
@Module({
    imports: [QueueModule],
    providers: [
        EmailProducer,
        EmailWorker,
        {
            provide: EMAIL_SENDER,
            useClass: SmtpEmailSender,
        },
    ],
    exports: [EMAIL_SENDER, EmailProducer],
})
export class EmailModule {}
