export class VerifyEmailCommand {
    constructor(public readonly verificationToken: string) {}
}
