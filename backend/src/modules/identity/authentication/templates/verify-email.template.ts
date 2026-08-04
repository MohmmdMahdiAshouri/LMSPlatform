export class VerifyEmailTemplate {
    static generate(username: string, verificationToken: string): string {
        return `<h1>Hello ${username},</h1>
            <p>Please verify your email by clicking on the link below:</p>
            <a href="http://localhost:3000/auth/verify-email?verification-token=${verificationToken}">Verify Email</a>
            <p>If you did not create an account, no further action is required.</p>`;
    }
}
