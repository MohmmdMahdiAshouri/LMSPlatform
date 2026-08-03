import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '@shared/queue/queue.constants';
import { VerifyEmailTemplate } from '../../templates/verify-email.template';
import { EmailSender } from '@shared/email/smtp-sender.port';
import { SendVerificationEmailJob } from '../jobs/send-email-verification.job';
import { Inject } from '@nestjs/common';
import { EMAIL_SENDER } from '@shared/email/injection.token';

@Processor(EMAIL_QUEUE)
export class EmailWorker extends WorkerHost {
    constructor(
        @Inject(EMAIL_SENDER)
        private readonly emailSender: EmailSender,
    ) {
        super();
    }

    async process(job: Job<SendVerificationEmailJob>): Promise<void> {
        switch (job.name) {
            case 'send-verification-email': {
                const { email, username, verificationToken } = job.data;
                const emailContent = VerifyEmailTemplate.generate(username, verificationToken);
                await this.emailSender.send({
                    to: email,
                    subject: 'Welcome!',
                    html: emailContent,
                });
                break;
            }
        }
    }
}
