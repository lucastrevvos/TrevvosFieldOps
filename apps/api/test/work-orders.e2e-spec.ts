import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import {
  WORK_ORDER_REPOSITORY,
  type WorkOrderRepository,
} from '../src/work-orders/application/work-order.repository.js';
import type { WorkOrder } from '../src/work-orders/domain/work-order.js';

class RecordingRepository implements WorkOrderRepository {
  saved: WorkOrder[] = [];

  saveWithInitialAuditEvent(workOrder: WorkOrder): Promise<void> {
    this.saved.push(workOrder);
    return Promise.resolve();
  }
}

describe('Create work order endpoint', () => {
  let app: INestApplication;
  let repository: RecordingRepository;

  beforeAll(async () => {
    repository = new RecordingRepository();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(WORK_ORDER_REPOSITORY)
      .useValue(repository)
      .compile();

    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    repository.saved = [];
  });

  it('creates one work order and returns its public identity', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/work-orders')
      .send({
        address: {
          city: 'Florianópolis',
          line1: 'Rua das Gaivotas, 120',
          postalCode: '88058-500',
          state: 'SC',
        },
        priority: 'HIGH',
        scheduledFor: new Date(Date.now() + 3_600_000).toISOString(),
        title: 'Inspect refrigeration unit',
      })
      .expect(201);

    const body = JSON.parse(response.text) as unknown;
    expect(body).toMatchObject({ status: 'PENDING_DISPATCH' });
    if (!body || typeof body !== 'object' || !('id' in body)) {
      throw new Error('Expected the response to contain an id.');
    }
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(repository.saved).toHaveLength(1);
  });

  it('returns problem details and persists nothing for invalid input', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/work-orders')
      .send({ priority: 'IMPOSSIBLE', title: 'x' })
      .expect(400)
      .expect('Content-Type', /application\/problem\+json/);

    expect(response.body).toMatchObject({
      instance: '/api/work-orders',
      status: 400,
      title: 'Invalid request',
    });
    expect(repository.saved).toHaveLength(0);
  });
});
