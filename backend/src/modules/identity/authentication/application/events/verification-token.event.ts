export class VerificationTokenEvent {
    static readonly TYPE = 'VerificationTokenEvent';

    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly username: string,
        public readonly verificationToken: string,
    ) {}
}
