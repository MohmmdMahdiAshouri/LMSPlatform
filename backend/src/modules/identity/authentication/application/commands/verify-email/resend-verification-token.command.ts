export class ResendVerificationTokenCommand {
    constructor(
        public readonly email: string,
        public readonly username: string,
    ) {}
}
