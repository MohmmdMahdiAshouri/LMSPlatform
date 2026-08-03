import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from '@shared/queue/queue.constants';

@Injectable()
export class EmailProducer {
    constructor(
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue,
    ) {}

    async sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<void> {
        await this.emailQueue.add(
            'send-verification-email',
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
}
