import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '@shared/queue/queue.constants';
import { VerifyEmailTemplate } from '../templates/verify-email.template';
import { EmailSender } from '@shared/email/smtp-sender.port';
import { SendVerificationEmailJob, SEND_VERIFICATION_EMAIL_JOB } from '../jobs/send-email.jobs';
import { Inject } from '@nestjs/common';
import { EMAIL_SENDER } from '@shared/email/injection.token';

@Processor(EMAIL_QUEUE)
export class VerificationEmailWorker extends WorkerHost {
    private readonly logger = new Logger(VerificationEmailWorker.name);

    constructor(
        @Inject(EMAIL_SENDER)
        private readonly emailSender: EmailSender,
    ) {
        super();
    }

    async process(job: Job<SendVerificationEmailJob>): Promise<void> {
        switch (job.name) {
            case SEND_VERIFICATION_EMAIL_JOB: {
                const { email, username, verificationToken } = job.data;
                const emailContent = VerifyEmailTemplate.generate(username, verificationToken);
                await this.emailSender.send({
                    to: email,
                    subject: 'Welcome!',
                    html: emailContent,
                });
                break;
            }
            default:
                this.logger.warn(`Unknown job name received: ${job.name}`);
        }
    }
}
