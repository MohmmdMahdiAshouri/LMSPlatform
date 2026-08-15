export class LogoutSpecificDeviceCommand {
    constructor(
        public readonly userId: string,
        public readonly sessionId: string,
    ) {}
}
