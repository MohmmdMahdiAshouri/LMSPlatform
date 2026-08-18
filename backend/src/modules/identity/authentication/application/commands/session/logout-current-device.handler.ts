import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCurrentDeviceCommand } from './logout-current-device.command';
import { AuthenticationService } from '../../services/authentication.service';

@CommandHandler(LogoutCurrentDeviceCommand)
export class LogoutCurrentDeviceHandler implements ICommandHandler<LogoutCurrentDeviceCommand> {
    constructor(private readonly authenticationService: AuthenticationService) {}
    async execute(command: LogoutCurrentDeviceCommand): Promise<void> {
        await this.authenticationService.revokeSession(command.userId, command.sessionId);
    }
}
