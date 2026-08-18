import { Inject, Injectable } from '@nestjs/common';
import { VerificationToken } from '../../domain/entities/verification-token.entity';
import { VERIFICATION_TOKEN_REPOSITORY } from '../tokens/injection.token';
import { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import { User } from '../../domain/entities/user.entity';
import { TokenGeneratorFactory } from '../factories/token-generator.factory';
import { OutboxMessage } from '@shared/common/domain/outbox-message.entity';
import type { OutboxMessageRepository } from '@shared/common/application/outbox-message.repository';
import { OUTBOX_REPOSITORY } from '@shared/common/domain/injection.token';
import { VerificationTokenEvent } from '../events/verification-token.event';

@Injectable()
export class VerificationTokenService {
    constructor(
        @Inject(VERIFICATION_TOKEN_REPOSITORY)
        private readonly verificationTokenRepository: VerificationTokenRepository,

        private readonly tokenGeneratorFactory: TokenGeneratorFactory,

        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: OutboxMessageRepository,
    ) {}

    async create(user: User) {
        const { tokenHash, plainToken, expiresAt } = this.tokenGeneratorFactory.create();

        const verificationToken = VerificationToken.create(user.getId(), tokenHash, expiresAt);

        await this.verificationTokenRepository.save(verificationToken);

        const outboxMessage = OutboxMessage.create(VerificationTokenEvent.TYPE, {
            userId: user.getId(),
            email: user.getEmail().getValue(),
            username: user.getUsername().getValue(),
            verificationToken: plainToken,
        });
        await this.outboxRepository.save(outboxMessage);
    }
}
