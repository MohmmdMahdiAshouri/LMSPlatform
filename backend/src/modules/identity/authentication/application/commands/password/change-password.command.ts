export class ChangePasswordCommand {
    constructor(
        public readonly userId: string,
        public readonly sessionId: string,
        public readonly currentPassword: string,
        public readonly newPassword: string,
    ) {}
}
