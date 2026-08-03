export abstract class EmailSender {
    abstract sendVerificationEmail(email: string, username: string, token: string): Promise<void>;
}
