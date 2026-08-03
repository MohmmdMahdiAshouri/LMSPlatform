import { SendEmailOptions } from './email.types';

export abstract class EmailSender {
    abstract send(options: SendEmailOptions): Promise<void>;
}
