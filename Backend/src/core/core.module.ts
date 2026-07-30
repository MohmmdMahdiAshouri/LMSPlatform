import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GlobalExceptionFilter } from '@shared/error-handling/filters/global-exception.filter';
import { AppValidationPipe } from '@shared/error-handling/pipes/app-validation.pipe';
import { ResponseInterceptor } from '@shared/response-handling/interceptors/response.interceptors';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            cache: true,
            expandVariables: true,
        }),
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
            useValue: new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        },
    ],
})
export class CoreModule {}
