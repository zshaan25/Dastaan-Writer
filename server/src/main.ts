import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import * as dns from 'node:dns';

// Ensure Node.js resolves MongoDB Atlas SRV records via reliable public DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback to default system DNS if custom servers fail
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Mandatory Environment Checks
  const mongoUri = configService.get<string>('MONGODB_URI');
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const geminiKey = configService.get<string>('GEMINI_API_KEY');
  const geminiModel = configService.get<string>('GEMINI_MODEL');

  if (!mongoUri) {
    logger.error('FATAL: MONGODB_URI environment variable is missing!');
    process.exit(1);
  }

  if (!jwtSecret) {
    logger.error('FATAL: JWT_SECRET environment variable is missing!');
    process.exit(1);
  }

  if (!geminiKey || !geminiKey.trim()) {
    logger.warn('WARNING: GEMINI_API_KEY environment variable is empty or missing! AI features require a valid key.');
  }

  if (!geminiModel || !geminiModel.trim()) {
    logger.error('FATAL: GEMINI_MODEL environment variable is missing!');
    process.exit(1);
  }

  // Initialize Sentry Application Monitoring (Observability Isolation)
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  const sentryEnv = configService.get<string>('SENTRY_ENVIRONMENT', 'development');

  if (sentryDsn && sentryDsn.trim()) {
    try {
      Sentry.init({
        dsn: sentryDsn.trim(),
        environment: sentryEnv,
        tracesSampleRate: sentryEnv === 'production' ? 0.2 : 1.0,
      });
      logger.log(`🛡️ Sentry initialized successfully in [${sentryEnv}] environment`);
    } catch (err: any) {
      logger.warn(`⚠️ Sentry initialization failed: ${err.message}. Application will continue without Sentry.`);
    }
  } else {
    logger.log('ℹ️ SENTRY_DSN not configured. Sentry backend monitoring is dormant.');
  }

  // Register Global Sentry Exception Filter
  app.useGlobalFilters(new SentryExceptionFilter());

  const port = configService.get<number>('PORT', 5000);
  const clientOrigin = configService.get<string>('CLIENT_ORIGIN', 'http://localhost:5173');

  // Enable Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global API prefix to /api
  app.setGlobalPrefix('api');

  // Configure CORS
  app.enableCors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // Configure Swagger / OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dastaan API')
    .setDescription(
      'Dastaan - AI-Powered Social Media Content & Publishing Assistant API Documentation.\n\n' +
      '### Authentication\n' +
      'Endpoints requiring JWT Bearer authentication can be tested by clicking **Authorize** and supplying a JWT token obtained from `POST /api/auth/login` or `POST /api/auth/register` (without the Bearer prefix).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token (without Bearer prefix)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'System health check and status')
    .addTag('Auth', 'User registration, login, and authentication session')
    .addTag('Users', 'User profile management and preferences')
    .addTag('AI', 'Direct Gemini AI content generation')
    .addTag('Conversations', 'Context-aware interactive post creation threads')
    .addTag('Posts', 'Canonical structured LinkedIn post generation, editing, and refinement')
    .addTag('Email', 'Transactional email verification and post delivery via Resend')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);
  logger.log(`🚀 Dastaan API server running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
  logger.log(`HEALTH CHECK: http://localhost:${port}/api/health`);
}

bootstrap();
