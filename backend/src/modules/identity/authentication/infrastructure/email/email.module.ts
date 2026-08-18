import { Module } from '@nestjs/common';
import { QueueModule } from '@shared/queue/queue.module';
import { BullMQEmailProducer } from './email.producer';
import { VerificationEmailWorker } from './workers/verification-email.worker';
import { PasswordResetEmailWorker } from './workers/password-reset-email.worker';
import { EMAIL_PRODUCER } from '../../application/tokens/injection.token';

@Module({
    imports: [QueueModule],
    providers: [
        {
            provide: EMAIL_PRODUCER,
            useClass: BullMQEmailProducer,
        },
        VerificationEmailWorker,
        PasswordResetEmailWorker,
    ],
    exports: [EMAIL_PRODUCER],
})
export class AuthenticationEmailModule {}
