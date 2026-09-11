import { Pool } from 'pg';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

import { WorkOrder } from '../src/work-orders/domain/work-order.js';
import { PostgresWorkOrderRepository } from '../src/work-orders/infrastructure/postgres-work-order.repository.js';
import { runMigrations } from '../src/infrastructure/database/run-migrations.js';

describe('PostgresWorkOrderRepository with PostgreSQL', () => {
  let container: StartedTestContainer | undefined;
  let pool: Pool | undefined;

  beforeAll(async () => {
    container = await new GenericContainer('postgres:17-alpine')
      .withEnvironment({
        POSTGRES_DB: 'fieldops_test',
        POSTGRES_PASSWORD: 'fieldops_test',
        POSTGRES_USER: 'fieldops_test',
      })
      .withExposedPorts(5432)
      // The official image reports readiness once for initialization and once for the final server.
      .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
      .start();

    pool = new Pool({
      database: 'fieldops_test',
      host: container.getHost(),
      password: 'fieldops_test',
      port: container.getMappedPort(5432),
      user: 'fieldops_test',
    });
    await runMigrations(pool);
  });

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it('persists the work order and audit event atomically', async () => {
    if (!pool) throw new Error('PostgreSQL test container did not start. Is Docker running?');
    const repository = new PostgresWorkOrderRepository(pool);
    const workOrder = WorkOrder.create(
      {
        address: {
          city: 'Florianópolis',
          line1: 'Rua das Gaivotas, 120',
          postalCode: '88058-500',
          state: 'SC',
        },
        priority: 'HIGH',
        scheduledFor: new Date('2099-10-20T13:30:00.000Z'),
        title: 'Inspect refrigeration unit',
      },
      new Date('2026-09-11T12:00:00.000Z'),
    );

    const correlationId = 'c0a80121-7ac0-4cae-8f91-62c439e8369d';
    await repository.saveWithInitialAuditEvent(workOrder, correlationId);

    const props = workOrder.toPrimitives();
    const savedOrder = await pool.query<{ id: string; status: string }>(
      'SELECT id, status FROM work_orders WHERE id = $1',
      [props.id],
    );
    const savedEvents = await pool.query<{ event_type: string }>(
      'SELECT event_type FROM audit_events WHERE aggregate_id = $1',
      [props.id],
    );
    const outboxEvents = await pool.query<{ correlation_id: string; event_type: string }>(
      'SELECT correlation_id, event_type FROM outbox_events WHERE aggregate_id = $1',
      [props.id],
    );
    expect(savedOrder.rows).toEqual([{ id: props.id, status: 'PENDING_DISPATCH' }]);
    expect(savedEvents.rows).toEqual([{ event_type: 'WorkOrderCreated' }]);
    expect(outboxEvents.rows).toEqual([
      { correlation_id: correlationId, event_type: 'WorkOrderCreated.v1' },
    ]);
  });
});
