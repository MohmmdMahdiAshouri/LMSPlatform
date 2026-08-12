import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '@shared/queue/queue.constants';
import { EmailSender } from '@shared/email/smtp-sender.port';
import { Inject } from '@nestjs/common';
import { EMAIL_SENDER } from '@shared/email/injection.token';
import { PasswordResetEmailTemplate } from '../../templates/password-reset-email.template';
import { SendPasswordResetEmailJob } from '../jobs/send-email-password-reset.job';

@Processor(EMAIL_QUEUE)
export class PasswordResetEmailWorker extends WorkerHost {
    constructor(
        @Inject(EMAIL_SENDER)
        private readonly emailSender: EmailSender,
    ) {
        super();
    }

    async process(job: Job<SendPasswordResetEmailJob>): Promise<void> {
        switch (job.name) {
            case 'send-password-reset-email': {
                const { email, passwordResetToken } = job.data;
                const emailContent = PasswordResetEmailTemplate.generate(passwordResetToken);
                await this.emailSender.send({
                    to: email,
                    subject: 'Reset Password!',
                    html: emailContent,
                });
                break;
            }
        }
    }
}
