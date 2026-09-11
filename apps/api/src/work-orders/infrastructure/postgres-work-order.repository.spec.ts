import type { Pool, PoolClient } from 'pg';

import { WorkOrder } from '../domain/work-order.js';
import { PostgresWorkOrderRepository } from './postgres-work-order.repository.js';

class RecordingClient {
  statements: string[] = [];
  released = 0;

  constructor(private readonly failOnFirstInsert = false) {}

  query(statement: string): Promise<{ rows: never[] }> {
    const operation = statement.trim().split(/\s/)[0] ?? '';
    this.statements.push(operation);
    if (this.failOnFirstInsert && operation === 'INSERT') {
      return Promise.reject(new Error('database unavailable'));
    }
    return Promise.resolve({ rows: [] });
  }

  release(): void {
    this.released += 1;
  }
}

function poolFor(client: RecordingClient): Pool {
  return {
    connect: () => Promise.resolve(client as unknown as PoolClient),
  } as unknown as Pool;
}

function validWorkOrder(): WorkOrder {
  return WorkOrder.create(
    {
      address: { city: 'Florianópolis', line1: 'Street', postalCode: '88058-500', state: 'SC' },
      priority: 'HIGH',
      scheduledFor: new Date('2026-10-20T13:30:00.000Z'),
      title: 'Inspect refrigeration unit',
    },
    new Date('2026-10-01T10:00:00.000Z'),
  );
}

describe('PostgresWorkOrderRepository', () => {
  it('commits the work order and audit event in one transaction', async () => {
    const client = new RecordingClient();
    const repository = new PostgresWorkOrderRepository(poolFor(client));

    await repository.saveWithInitialAuditEvent(
      validWorkOrder(),
      'c0a80121-7ac0-4cae-8f91-62c439e8369d',
    );

    expect(client.statements).toEqual(['BEGIN', 'INSERT', 'INSERT', 'INSERT', 'COMMIT']);
    expect(client.released).toBe(1);
  });

  it('rolls back and releases the connection after a failed insert', async () => {
    const client = new RecordingClient(true);
    const repository = new PostgresWorkOrderRepository(poolFor(client));

    await expect(
      repository.saveWithInitialAuditEvent(
        validWorkOrder(),
        'c0a80121-7ac0-4cae-8f91-62c439e8369d',
      ),
    ).rejects.toThrow('database unavailable');
    expect(client.statements).toEqual(['BEGIN', 'INSERT', 'ROLLBACK']);
    expect(client.released).toBe(1);
  });
});
