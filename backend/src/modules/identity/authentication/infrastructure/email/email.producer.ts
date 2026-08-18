import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from '@shared/queue/queue.constants';
import { SEND_PASSWORD_RESET_EMAIL_JOB, SEND_VERIFICATION_EMAIL_JOB } from './jobs/send-email.jobs';
import { EmailProducer } from '../../application/ports/email-producer.port';

@Injectable()
export class BullMQEmailProducer implements EmailProducer {
    constructor(
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue,
    ) {}

    async sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<void> {
        await this.emailQueue.add(
            SEND_VERIFICATION_EMAIL_JOB,
            {
                email,
                username,
                verificationToken,
            },
            {
                attempts: 3,

                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },

                removeOnComplete: 100,

                removeOnFail: 100,
            },
        );
    }

    async sendPasswordResetEmail(email: string, passwordResetToken: string): Promise<void> {
        await this.emailQueue.add(
            SEND_PASSWORD_RESET_EMAIL_JOB,
            {
                email,
                passwordResetToken,
            },
            {
                attempts: 3,

                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },

                removeOnComplete: 100,

                removeOnFail: 100,
            },
        );
    }
}
