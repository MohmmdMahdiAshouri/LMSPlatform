import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationController } from './presentation/controllers/authentication.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import {
    CLOCK,
    PASSWORD_HASHER,
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
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
import { AuthenticationService } from './application/services/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGenerator } from './application/ports/access-token-generator.port';
import { JwtTokenGenerator } from './infrastructure/security/jwt-token-generator';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.respository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { VerifyEmailHandler } from './application/commands/verify-email/verify-email.handler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationContextMapper } from './presentation/mappers/authentication-context.mapper';
import { LoginHandler } from './application/commands/login/login.handler';
@Module({
    imports: [
        CqrsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: '15m',
                },
            }),
        }),
    ],
    controllers: [AuthenticationController],
    providers: [
        RegisterHandler,
        VerifyEmailHandler,
        VerificationTokenFactory,
        UserRegisteredEventHandler,
        AuthenticationService,
        AuthenticationContextMapper,
        LoginHandler,
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
        { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
        { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
        {
            provide: AccessTokenGenerator,
            useClass: JwtTokenGenerator,
        },
    ],
    exports: [AccessTokenGenerator, SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY],
})
export class AuthenticationModule {}
