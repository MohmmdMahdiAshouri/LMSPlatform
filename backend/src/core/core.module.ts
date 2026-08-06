import { AuthenticationModule } from '@modules/identity/authentication/authentication.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EmailModule } from '@shared/email/email.module';
import { GlobalExceptionFilter } from '@shared/error-handling/filters/global-exception.filter';
import { AppValidationPipe } from '@shared/error-handling/pipes/app-validation.pipe';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { QueueModule } from '@shared/queue/queue.module';
import { ResponseInterceptor } from '@shared/response-handling/interceptors/response.interceptors';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            cache: true,
            expandVariables: true,
        }),
        ClsModule.forRoot({
            middleware: { mount: true },
            plugins: [
                new ClsPluginTransactional({
                    imports: [PrismaModule],
                    adapter: new TransactionalAdapterPrisma({
                        prismaInjectionToken: PrismaService,
                    }),
                }),
            ],
        }),
        PrismaModule,
        QueueModule,
        EmailModule,
        AuthenticationModule,
    ],
    providers: [
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_PIPE,
            useClass: AppValidationPipe,
        },
    ],
})
export class CoreModule {}
