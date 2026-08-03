import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './queue.constants';
import { EmailWorker } from '@modules/identity/authentication/application/worker/verification-email.worker';
import { EmailProducer } from '@modules/identity/authentication/application/producers/email.producer';

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
    providers: [EmailProducer, EmailWorker],
})
export class QueueModule {}
