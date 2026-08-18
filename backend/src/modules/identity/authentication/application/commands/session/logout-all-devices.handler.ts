import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutAllDevicesCommand } from './logout-all-devices.command';
import { AuthenticationService } from '../../services/authentication.service';

@CommandHandler(LogoutAllDevicesCommand)
export class LogoutAllSessionsHandler implements ICommandHandler<LogoutAllDevicesCommand> {
    constructor(private readonly authenticationService: AuthenticationService) {}
    async execute(command: LogoutAllDevicesCommand): Promise<void> {
        await this.authenticationService.revokeAllSessions(command.userId);
    }
}
