export interface SendVerificationEmailJob {
    email: string;
    username: string;
    verificationToken: string;
}
