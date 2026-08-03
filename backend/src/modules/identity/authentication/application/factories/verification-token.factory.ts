import { Inject, Injectable } from '@nestjs/common';
import { VerificationToken } from '../../domain/entities/verification-token.entity';
import { TokenGenerator } from '../ports/token-generator.port';
import { TokenHasher } from '../ports/token-hasher.port';
import { Clock } from '../ports/clock.port';
import { VerificationTokenFactoryResult } from './verification-token-factory-result.port';
import { CLOCK, TOKEN_GENERATOR, TOKEN_HASHER } from '../tokens/injection.token';

@Injectable()
export class VerificationTokenFactory {
    private static readonly EXPIRES_IN_MINUTES = 15;

    constructor(
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,

        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,

        @Inject(CLOCK)
        private readonly clock: Clock,
    ) {}

    create(userId: string): VerificationTokenFactoryResult {
        const plainToken = this.tokenGenerator.generate();

        const tokenHash = this.tokenHasher.hash(plainToken);

        const now = this.clock.now();

        const expiresAt = new Date(now.getTime() + VerificationTokenFactory.EXPIRES_IN_MINUTES * 60 * 1000);

        const verificationToken = VerificationToken.create(userId, tokenHash, expiresAt);

        return {
            plainToken,
            verificationToken,
        };
    }
}
