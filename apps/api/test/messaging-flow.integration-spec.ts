import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

import { runMigrations } from '../src/infrastructure/database/run-migrations.js';
import { DispatchPreparationHandler } from '../src/messaging/dispatch-preparation.handler.js';
import { OutboxRelay } from '../src/messaging/outbox-relay.js';
import { OutboxStore } from '../src/messaging/outbox-store.js';
import { type EventHandler, RabbitMqBroker } from '../src/messaging/rabbitmq-broker.js';
import type { WorkOrderCreatedEvent } from '../src/messaging/work-order-created.event.js';
import { WorkOrder } from '../src/work-orders/domain/work-order.js';
import { PostgresWorkOrderRepository } from '../src/work-orders/infrastructure/postgres-work-order.repository.js';

async function eventually(assertion: () => Promise<boolean>, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await assertion()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Condition was not met before the integration-test timeout.');
}

describe('outbox and RabbitMQ delivery', () => {
  let postgres: StartedTestContainer | undefined;
  let rabbitmq: StartedTestContainer | undefined;
  let pool: Pool | undefined;
  let broker: RabbitMqBroker | undefined;

  beforeAll(async () => {
    [postgres, rabbitmq] = await Promise.all([
      new GenericContainer('postgres:17-alpine')
        .withEnvironment({
          POSTGRES_DB: 'fieldops_test',
          POSTGRES_PASSWORD: 'fieldops_test',
          POSTGRES_USER: 'fieldops_test',
        })
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
        .start(),
      new GenericContainer('rabbitmq:4-alpine')
        .withEnvironment({
          RABBITMQ_DEFAULT_PASS: 'fieldops_test',
          RABBITMQ_DEFAULT_USER: 'fieldops_test',
        })
        .withExposedPorts(5672)
        .withWaitStrategy(Wait.forLogMessage(/Server startup complete/))
        .start(),
    ]);
    pool = new Pool({
      database: 'fieldops_test',
      host: postgres.getHost(),
      password: 'fieldops_test',
      port: postgres.getMappedPort(5432),
      user: 'fieldops_test',
    });
    await runMigrations(pool);
    broker = await RabbitMqBroker.connect(
      `amqp://fieldops_test:fieldops_test@${rabbitmq.getHost()}:${rabbitmq.getMappedPort(5672)}`,
      100,
      2,
    );
  });

  afterAll(async () => {
    await broker?.close();
    await pool?.end();
    await Promise.all([postgres?.stop(), rabbitmq?.stop()]);
  });

  it('recovers from a temporary failure, handles duplicates and dead-letters poison messages', async () => {
    if (!pool || !broker) throw new Error('Test containers did not start. Is Docker running?');
    const workOrder = WorkOrder.create(
      {
        address: { city: 'Florianópolis', line1: 'Street', postalCode: '88058-500', state: 'SC' },
        priority: 'HIGH',
        scheduledFor: new Date('2099-10-20T13:30:00.000Z'),
        title: 'Inspect refrigeration unit',
      },
      new Date('2026-09-11T12:00:00.000Z'),
    );
    const correlationId = randomUUID();
    await new PostgresWorkOrderRepository(pool).saveWithInitialAuditEvent(workOrder, correlationId);
    const stored = await pool.query<{ payload: WorkOrderCreatedEvent }>(
      'SELECT payload FROM outbox_events WHERE aggregate_id = $1',
      [workOrder.toPrimitives().id],
    );
    const event = stored.rows[0]?.payload;
    if (!event) throw new Error('Expected an outbox event.');

    const realHandler = new DispatchPreparationHandler(pool);
    let failuresRemaining = 1;
    const flakyHandler: EventHandler = {
      handle: async (incoming) => {
        if (failuresRemaining-- > 0) throw new Error('temporary downstream failure');
        return realHandler.handle(incoming);
      },
    };
    await broker.consume(flakyHandler);
    await new OutboxRelay(new OutboxStore(pool), broker).publishBatch();

    await eventually(async () => {
      const result = await pool?.query('SELECT 1 FROM dispatch_jobs WHERE work_order_id = $1', [
        event.data.workOrderId,
      ]);
      return result?.rowCount === 1;
    });

    await broker.publish(event);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const jobs = await pool.query('SELECT 1 FROM dispatch_jobs WHERE work_order_id = $1', [
      event.data.workOrderId,
    ]);
    expect(jobs.rowCount).toBe(1);

    await broker.publish({
      ...event,
      data: { ...event.data, workOrderId: randomUUID() },
      eventId: randomUUID(),
    });
    await eventually(async () => (await broker?.getDeadLetterCount()) === 1);
  });
});
