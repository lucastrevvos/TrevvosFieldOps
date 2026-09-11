import type { Pool } from 'pg';

import type { WorkOrderCreatedEvent } from './work-order-created.event.js';

export class DispatchPreparationHandler {
  static readonly consumerName = 'dispatch-preparation.v1';

  constructor(private readonly pool: Pool) {}

  async handle(event: WorkOrderCreatedEvent): Promise<'processed' | 'duplicate'> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const consumed = await client.query(
        `INSERT INTO consumed_events (event_id, consumer)
         VALUES ($1, $2) ON CONFLICT (event_id) DO NOTHING RETURNING event_id`,
        [event.eventId, DispatchPreparationHandler.consumerName],
      );
      if (consumed.rowCount === 0) {
        await client.query('COMMIT');
        return 'duplicate';
      }
      await client.query(
        `INSERT INTO dispatch_jobs (work_order_id, status, correlation_id)
         VALUES ($1, 'READY_FOR_DISPATCH', $2)
         ON CONFLICT (work_order_id) DO NOTHING`,
        [event.data.workOrderId, event.correlationId],
      );
      await client.query('COMMIT');
      return 'processed';
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
