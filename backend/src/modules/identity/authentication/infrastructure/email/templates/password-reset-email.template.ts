export class PasswordResetEmailTemplate {
    static generate(passwordResetToken: string): string {
        return `<h1>Hello dear</h1>
            <p>Please reset your password by clicking on the link below:</p>
            <a href="http://localhost:3000/auth/forgot-password?password-reset-token=${passwordResetToken}">Reset Password</a>
            <p>If you did not create an account, no further action is required.</p>`;
    }
}
