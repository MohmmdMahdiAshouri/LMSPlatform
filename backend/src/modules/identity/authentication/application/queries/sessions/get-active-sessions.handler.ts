import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActiveSessionsQuery } from './get-active-sessions.query';
import { Inject } from '@nestjs/common';
import { SESSION_REPOSITORY } from '../../tokens/injection.token';
import { SessionRepository } from '@modules/identity/authentication/domain/repositories/session.repository';
import { ActiveSession } from '../../contracts/active-sessions';

@QueryHandler(GetActiveSessionsQuery)
export class GetActiveSessionsHandler implements IQueryHandler<GetActiveSessionsQuery> {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
    ) {}
    async execute(query: GetActiveSessionsQuery): Promise<ActiveSession[]> {
        const sessions = await this.sessionRepository.findAllActiveByUserId(query.userId);
        return sessions.map((session): ActiveSession => ({
            id: session.getId(),
            deviceType: session.getDeviceType(),
            browser: session.getBrowser(),
            os: session.getOperatingSystem(),
            lastActivityAt: session.getLastActivityAt(),
            expiresAt: session.getExpiresAt(),
        }));
    }
}
