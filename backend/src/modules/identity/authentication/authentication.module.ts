import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationController } from './presentation/controllers/authentication.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import {
    CLOCK,
    PASSWORD_HASHER,
    PASSWORD_RESET_TOKEN_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    SESSION_REPOSITORY,
    TOKEN_GENERATOR,
    TOKEN_HASHER,
    USER_REPOSITORY,
    VERIFICATION_TOKEN_REPOSITORY,
} from './application/tokens/injection.token';
import { AuthenticationEmailModule } from './infrastructure/email/email.module';
import { RegisterHandler } from './application/commands/auth/register.handler';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { VerificationTokenEventHandler } from './application/event-handlers/verification-token.event.handler';
import { TokenGeneratorFactory } from './application/factories/token-generator.factory';
import { VerificationTokenService } from './application/services/verification-token.service';
import { SystemClock } from './infrastructure/security/system-clock';
import { Sha256TokenHasher } from './infrastructure/security/sha256-token-hasher';
import { CryptoTokenGenerator } from './infrastructure/security/crypto-token-generator';
import { PrismaVerificationTokenRepository } from './infrastructure/persistence/prisma-verification-token.repository';
import { AuthenticationService } from './application/services/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGenerator } from './application/ports/access-token-generator.port';
import { JwtTokenGenerator } from './infrastructure/security/jwt-token-generator';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { VerifyEmailHandler } from './application/commands/verify-email/verify-email.handler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationContextMapper } from './presentation/mappers/authentication-context.mapper';
import { LoginHandler } from './application/commands/auth/login.handler';
import { ResendVerificationTokenHandler } from './application/commands/verify-email/resend-verification-token.handler';
import { VerificationController } from './presentation/controllers/verification.controller';
import { PrismaPasswordResetTokenRepository } from './infrastructure/persistence/prisma-password-reset-token.repository';
import { PasswordController } from './presentation/controllers/password.controller';
import { ForgotPasswordHandler } from './application/commands/password/forgot-password.handler';
import { OUTBOX_REPOSITORY } from '@shared/common/domain/injection.token';
import { PrismaOutboxRepository } from '@shared/common/infrastructure/prisma-outbox-message.repository';
import { ResetPasswordHandler } from './application/commands/password/reset-password.handler';
import { JwtStrategy } from './infrastructure/security/jwt-strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth-guard';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { CachedSessionRepository } from './infrastructure/persistence/cached-session.repository';
import { ChangePasswordHandler } from './application/commands/password/change-password.handler';
import { CachedUserRepository } from './infrastructure/persistence/cached-user.repository';
import { RefreshTokenHandler } from './application/commands/auth/refresh-token.handler';
import { LogoutCurrentDeviceHandler } from './application/commands/session/logout-current-device.handler';
import { SessionController } from './presentation/controllers/session.controller';
import { LogoutAllSessionsHandler } from './application/commands/session/logout-all-devices.handler';
import { LogoutSpecificDeviceHandler } from './application/commands/session/logout-specific-device.handler';
import { GetCurrentUserHandler } from './application/queries/me/get-current-user.handler';
import { GetActiveSessionsHandler } from './application/queries/sessions/get-active-sessions.handler';
import { GoogleLoginHandler } from './application/commands/auth/google-login.handler';
import { GoogleStrategy } from './infrastructure/security/google.strategy';
import { PasswordResetTokenEventHandler } from './application/event-handlers/password-reset-token.event.handler';
import { OUTBOX_EVENT_FACTORIES } from '@shared/common/domain/outbox-event-factory';
import { AUTH_OUTBOX_EVENT_FACTORIES } from './application/events/outbox-event-factories';
import { AUTH_CONFIG } from './application/config/auth-config';
@Module({
    imports: [
        CqrsModule,
        AuthenticationEmailModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: `${AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN_MINUTES}m`,
                },
            }),
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [AuthenticationController, VerificationController, PasswordController, SessionController],
    providers: [
        RegisterHandler,
        VerifyEmailHandler,
        TokenGeneratorFactory,
        VerificationTokenService,
        VerificationTokenEventHandler,
        PasswordResetTokenEventHandler,
        AuthenticationService,
        AuthenticationContextMapper,
        LoginHandler,
        ResendVerificationTokenHandler,
        ForgotPasswordHandler,
        ResetPasswordHandler,
        JwtStrategy,
        JwtAuthGuard,
        PrismaSessionRepository,
        ChangePasswordHandler,
        PrismaUserRepository,
        PrismaRefreshTokenRepository,
        RefreshTokenHandler,
        LogoutCurrentDeviceHandler,
        LogoutAllSessionsHandler,
        LogoutSpecificDeviceHandler,
        GetCurrentUserHandler,
        GetActiveSessionsHandler,
        GoogleLoginHandler,
        GoogleStrategy,
        {
            provide: USER_REPOSITORY,
            useClass: CachedUserRepository,
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
        {
            provide: PASSWORD_RESET_TOKEN_REPOSITORY,
            useClass: PrismaPasswordResetTokenRepository,
        },
        { provide: SESSION_REPOSITORY, useClass: CachedSessionRepository },
        { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
        {
            provide: AccessTokenGenerator,
            useClass: JwtTokenGenerator,
        },
        { provide: OUTBOX_REPOSITORY, useClass: PrismaOutboxRepository },
        { provide: OUTBOX_EVENT_FACTORIES, useValue: AUTH_OUTBOX_EVENT_FACTORIES },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
    exports: [AccessTokenGenerator, SESSION_REPOSITORY, REFRESH_TOKEN_REPOSITORY, OUTBOX_EVENT_FACTORIES],
})
export class AuthenticationModule {}
