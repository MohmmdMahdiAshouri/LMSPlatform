import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailSender } from './smtp-sender.port';
import { SendEmailOptions } from './email.types';

@Injectable()
export class SmtpEmailSender implements EmailSender {
    private readonly transporter: nodemailer.Transporter;
    private readonly from: string;

    constructor(configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: configService.getOrThrow<string>('SMTP_HOST'),
            port: Number(configService.getOrThrow<string>('SMTP_PORT')),
            secure: false,
        });
        this.from = configService.getOrThrow<string>('SMTP_FROM');
    }

    async send(options: SendEmailOptions): Promise<void> {
        await this.transporter.sendMail({
            from: this.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
}
