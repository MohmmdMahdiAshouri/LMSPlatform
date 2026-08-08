import { Inject, Injectable } from '@nestjs/common';
import { VerificationToken } from '../../domain/entities/verification-token.entity';
import { TokenGenerator } from '../ports/token-generator.port';
import { TokenHasher } from '../ports/token-hasher.port';
import { Clock } from '../ports/clock.port';
import { CLOCK, TOKEN_GENERATOR, TOKEN_HASHER, VERIFICATION_TOKEN_REPOSITORY } from '../tokens/injection.token';
import { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import { EventBus } from '@nestjs/cqrs';
import { VerificationTokenEvent } from '../events/verification-token.event';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class VerificationTokenService {
    private static readonly EXPIRES_IN_MINUTES = 15;

    constructor(
        @Inject(VERIFICATION_TOKEN_REPOSITORY)
        private readonly verificationTokenRepository: VerificationTokenRepository,

        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,

        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,

        @Inject(CLOCK)
        private readonly clock: Clock,

        private readonly eventBus: EventBus,
    ) {}

    async create(user: User) {
        const plainToken = this.tokenGenerator.generate();

        const tokenHash = this.tokenHasher.hash(plainToken);

        const now = this.clock.now();

        const expiresAt = new Date(now.getTime() + VerificationTokenService.EXPIRES_IN_MINUTES * 60 * 1000);

        const verificationToken = VerificationToken.create(user.getId(), tokenHash, expiresAt);

        await this.verificationTokenRepository.save(verificationToken);

        this.eventBus.publish(
            new VerificationTokenEvent(
                user.getId(),
                user.getEmail().getValue(),
                user.getUsername().getValue(),
                plainToken,
            ),
        );
    }
}
