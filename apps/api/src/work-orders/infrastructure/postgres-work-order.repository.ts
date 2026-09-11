import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';

import { DATABASE_POOL } from '../../infrastructure/database/database.module.js';
import {
  WORK_ORDER_CREATED_EVENT,
  type WorkOrderCreatedEvent,
} from '../../messaging/work-order-created.event.js';
import type { WorkOrderRepository } from '../application/work-order.repository.js';
import type { WorkOrder } from '../domain/work-order.js';

@Injectable()
export class PostgresWorkOrderRepository implements WorkOrderRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async saveWithInitialAuditEvent(workOrder: WorkOrder, correlationId: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await this.insertWorkOrder(client, workOrder);
      await this.insertAuditEvent(client, workOrder);
      await this.insertOutboxEvent(client, workOrder, correlationId);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertOutboxEvent(
    client: PoolClient,
    workOrder: WorkOrder,
    correlationId: string,
  ): Promise<void> {
    const props = workOrder.toPrimitives();
    const event: WorkOrderCreatedEvent = {
      correlationId,
      data: {
        priority: props.priority,
        scheduledFor: props.scheduledFor.toISOString(),
        status: props.status,
        title: props.title,
        workOrderId: props.id,
      },
      eventId: randomUUID(),
      occurredAt: props.createdAt.toISOString(),
      type: WORK_ORDER_CREATED_EVENT,
    };
    await client.query(
      `INSERT INTO outbox_events (id, aggregate_id, event_type, correlation_id, occurred_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.eventId, props.id, event.type, correlationId, props.createdAt, JSON.stringify(event)],
    );
  }

  private async insertWorkOrder(client: PoolClient, workOrder: WorkOrder): Promise<void> {
    const props = workOrder.toPrimitives();
    await client.query(
      `INSERT INTO work_orders (
        id, title, description, priority, status, scheduled_for,
        address_line1, address_city, address_state, address_postal_code, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        props.id,
        props.title,
        props.description ?? null,
        props.priority,
        props.status,
        props.scheduledFor,
        props.address.line1,
        props.address.city,
        props.address.state,
        props.address.postalCode,
        props.createdAt,
      ],
    );
  }

  private async insertAuditEvent(client: PoolClient, workOrder: WorkOrder): Promise<void> {
    const props = workOrder.toPrimitives();
    await client.query(
      `INSERT INTO audit_events (
        aggregate_type, aggregate_id, event_type, occurred_at, payload
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        'WorkOrder',
        props.id,
        'WorkOrderCreated',
        props.createdAt,
        JSON.stringify({ priority: props.priority, status: props.status }),
      ],
    );
  }
}
