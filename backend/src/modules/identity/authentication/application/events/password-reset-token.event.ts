export class PasswordResetTokenEvent {
    static readonly TYPE = 'PasswordResetTokenEvent';

    constructor(
        public readonly email: string,
        public readonly passwordResetToken: string,
    ) {}
}
