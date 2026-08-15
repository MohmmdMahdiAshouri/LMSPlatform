import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutSpecificDeviceCommand } from './logout-specific-device.command';
import { AuthenticationService } from '../../services/authentication.service';

@CommandHandler(LogoutSpecificDeviceCommand)
export class LogoutSpecificDeviceHandler implements ICommandHandler<LogoutSpecificDeviceCommand> {
    constructor(private readonly authenticationService: AuthenticationService) {}
    async execute(command: LogoutSpecificDeviceCommand): Promise<any> {
        await this.authenticationService.revokeSession(command.userId, command.sessionId);
    }
}
