import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api', {
        exclude: ['/docs'],
    });

    app.use(helmet());

    app.use(cookieParser());

    const configService = app.get(ConfigService);
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('LMS API')
        .setDescription('LMS Platform REST API')
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter access token',
            },
            'access-token',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document);

    await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
