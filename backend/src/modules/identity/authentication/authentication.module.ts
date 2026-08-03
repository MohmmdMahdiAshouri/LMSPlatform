import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationController } from './presentation/controllers/authentication.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import {
    CLOCK,
    PASSWORD_HASHER,
    TOKEN_GENERATOR,
    TOKEN_HASHER,
    USER_REPOSITORY,
    VERIFICATION_TOKEN_REPOSITORY,
} from './application/tokens/injection.token';
import { RegisterHandler } from './application/commands/register/register.handler';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { UserRegisteredEventHandler } from './application/event-handlers/user-registered.handler';
import { VerificationTokenFactory } from './application/factories/verification-token.factory';
import { SystemClock } from './infrastructure/security/system-clock';
import { Sha256TokenHasher } from './infrastructure/security/sha256-token-hasher';
import { CryptoTokenGenerator } from './infrastructure/security/crypto-token-generator';
import { PrismaVerificationTokenRepository } from './infrastructure/persistence/prisma-verification-token.repository';

@Module({
    imports: [CqrsModule],
    controllers: [AuthenticationController],
    providers: [
        RegisterHandler,
        VerificationTokenFactory,
        UserRegisteredEventHandler,
        {
            provide: USER_REPOSITORY,
            useClass: PrismaUserRepository,
        },
        {
            provide: PASSWORD_HASHER,
            useClass: BcryptPasswordHasher,
        },
        {
            provide: TOKEN_GENERATOR,
            useClass: CryptoTokenGenerator,
        },

        {
            provide: TOKEN_HASHER,
            useClass: Sha256TokenHasher,
        },

        {
            provide: CLOCK,
            useClass: SystemClock,
        },
        {
            provide: VERIFICATION_TOKEN_REPOSITORY,
            useClass: PrismaVerificationTokenRepository,
        },
    ],
})
export class AuthenticationModule {}
