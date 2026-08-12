import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './queue.constants';
import { VerificationEmailWorker } from '@modules/identity/authentication/application/worker/verification-email.worker';
import { EmailProducer } from '@modules/identity/authentication/application/producers/email.producer';
import { PasswordResetEmailWorker } from '@modules/identity/authentication/application/worker/password-reset-token.worker';

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.getOrThrow<string>('REDIS_HOST'),
                    port: config.getOrThrow<number>('REDIS_PORT'),
                },
            }),
        }),
        BullModule.registerQueue({
            name: EMAIL_QUEUE,
        }),
    ],
    exports: [BullModule, EmailProducer],
    providers: [EmailProducer, VerificationEmailWorker, PasswordResetEmailWorker],
})
export class QueueModule {}
