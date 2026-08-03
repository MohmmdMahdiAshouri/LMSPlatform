import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailSender } from './smtp-sender.port';
import { SendEmailOptions } from './email.types';

@Injectable()
export class SmtpEmailSender implements EmailSender {
    private readonly transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
    });

    async send(options: SendEmailOptions): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
}
