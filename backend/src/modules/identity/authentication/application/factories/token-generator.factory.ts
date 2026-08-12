import { Clock } from '@modules/identity/authentication/application/ports/clock.port';
import { TokenGenerator } from '@modules/identity/authentication/application/ports/token-generator.port';
import { TokenHasher } from '@modules/identity/authentication/application/ports/token-hasher.port';
import {
    CLOCK,
    TOKEN_GENERATOR,
    TOKEN_HASHER,
} from '@modules/identity/authentication/application/tokens/injection.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TokenGeneratorFactory {
    private static readonly EXPIRES_IN_MINUTES = 15;

    constructor(
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,

        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,

        @Inject(CLOCK)
        private readonly clock: Clock,
    ) {}
    create() {
        const plainToken = this.tokenGenerator.generate();

        const tokenHash = this.tokenHasher.hash(plainToken);

        const now = this.clock.now();

        const expiresAt = new Date(now.getTime() + TokenGeneratorFactory.EXPIRES_IN_MINUTES * 60 * 1000);

        return { plainToken, tokenHash, expiresAt };
    }
}
