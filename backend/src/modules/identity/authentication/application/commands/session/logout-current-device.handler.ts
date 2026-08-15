import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCurrentDeviceCommand } from './logout-current-device.command';
import { Inject } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY, SESSION_REPOSITORY } from '../../tokens/injection.token';
import { SessionRepository } from '@modules/identity/authentication/domain/repositories/session.repository';
import { RefreshTokenRepository } from '@modules/identity/authentication/domain/repositories/refresh-token.repository';
import { SessionIsInvalidOrRevokedException } from '@modules/identity/authentication/domain/exceptions/session-is-invalid-or-revoked.exception';
import { RefreshTokenNotFoundException } from '@modules/identity/authentication/domain/exceptions/refresh-token-not-found.exception';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(LogoutCurrentDeviceCommand)
export class LogoutCurrentDeviceHandler implements ICommandHandler<LogoutCurrentDeviceCommand> {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}
    @Transactional()
    async execute(command: LogoutCurrentDeviceCommand): Promise<any> {
        const session = await this.sessionRepository.findById(command.sessionId);
        if (!session) throw new SessionIsInvalidOrRevokedException();

        if (session.getUserId() !== command.userId) throw new SessionIsInvalidOrRevokedException();

        const refreshToken = await this.refreshTokenRepository.findBySessionId(session.getId());
        if (!refreshToken) throw new RefreshTokenNotFoundException();

        refreshToken.revoke();
        await this.refreshTokenRepository.update(refreshToken);
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
