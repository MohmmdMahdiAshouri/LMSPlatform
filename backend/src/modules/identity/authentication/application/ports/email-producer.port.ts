export abstract class EmailProducer {
    abstract sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<void>;
    abstract sendPasswordResetEmail(email: string, passwordResetToken: string): Promise<void>;
}
