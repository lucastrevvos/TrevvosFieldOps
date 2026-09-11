import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

describe('Health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a healthy HTTP response', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(({ text }) => {
        const body: unknown = JSON.parse(text);

        expect(body).toMatchObject({
          service: 'trevvos-fieldops-api',
          status: 'ok',
        });
      });
  });
});
