import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '../../.env.local') });

const app = await NestFactory.create(AppModule, { bufferLogs: true });
const allowedOrigins = new Set(
  (process.env.WEB_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.setGlobalPrefix('api');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
  exposedHeaders: ['Set-Cookie'],
});

const openApiConfig = new DocumentBuilder()
  .setTitle('UniMovil API')
  .setDescription('API REST de cuentas, favoritos e incidencias de UniMovil.')
  .setVersion('0.1.0')
  .addBearerAuth()
  .build();
const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
SwaggerModule.setup('api/docs', app, openApiDocument, {
  swaggerOptions: { persistAuthorization: false },
});

const port = Number(process.env.API_PORT ?? 3001);
await app.listen(port, process.env.API_HOST ?? '127.0.0.1');
