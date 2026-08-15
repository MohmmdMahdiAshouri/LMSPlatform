export class LogoutCurrentDeviceCommand {
    constructor(
        public readonly userId: string,
        public readonly sessionId: string,
    ) {}
}
