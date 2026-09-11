import { ValidationPipe, type INestApplication } from '@nestjs/common';

import { ProblemDetailsFilter } from './shared/http/problem-details.filter.js';

export function configureApp(app: INestApplication): void {
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
}
