import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

  app.enableCors({ origin: webOrigin });
  app.setGlobalPrefix('api');

  await app.listen(port);
}

void bootstrap();
