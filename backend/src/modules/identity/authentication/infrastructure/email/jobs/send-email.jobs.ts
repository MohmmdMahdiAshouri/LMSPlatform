export const SEND_VERIFICATION_EMAIL_JOB = 'send-verification-email';
export const SEND_PASSWORD_RESET_EMAIL_JOB = 'send-password-reset-email';

export interface SendVerificationEmailJob {
    email: string;
    username: string;
    verificationToken: string;
}

export interface SendPasswordResetEmailJob {
    email: string;
    passwordResetToken: string;
}
