import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module.js';
import { RedisIoAdapter } from './redis-io.adapter.js';

config({ path: '../.env', quiet: true });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');
  const appDomain = process.env.APP_DOMAIN?.trim();
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:3000',
      ...(appDomain ? [`https://${appDomain}`] : []),
    ],
    credentials: true,
  });
  app.enableShutdownHooks();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const cacheUrl = process.env.CACHE_URL;
  if (!cacheUrl) {
    throw new Error('CACHE_URL is required');
  }

  const redisIoAdapter = new RedisIoAdapter(app, cacheUrl);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = Number(process.env.BACKEND_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
