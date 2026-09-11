import type { Pool } from 'pg';

import type { WorkOrderCreatedEvent } from './work-order-created.event.js';

export interface ClaimedOutboxEvent {
  attempts: number;
  event: WorkOrderCreatedEvent;
  id: string;
}

export class OutboxStore {
  constructor(private readonly pool: Pool) {}

  async claimPending(limit = 20): Promise<ClaimedOutboxEvent[]> {
    const result = await this.pool.query<{
      attempts: number;
      id: string;
      payload: WorkOrderCreatedEvent;
    }>(
      `UPDATE outbox_events
       SET attempts = attempts + 1, next_attempt_at = now() + interval '30 seconds'
       WHERE id IN (
         SELECT id FROM outbox_events
         WHERE published_at IS NULL AND next_attempt_at <= now()
         ORDER BY occurred_at
         FOR UPDATE SKIP LOCKED
         LIMIT $1
       )
       RETURNING id, attempts, payload`,
      [limit],
    );
    return result.rows.map((row) => ({ attempts: row.attempts, event: row.payload, id: row.id }));
  }

  async markPublished(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE outbox_events SET published_at = now(), last_error = NULL WHERE id = $1',
      [id],
    );
  }

  async markFailed(id: string, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    await this.pool.query(
      `UPDATE outbox_events
       SET last_error = $2, next_attempt_at = now() + interval '5 seconds'
       WHERE id = $1`,
      [id, message.slice(0, 2_000)],
    );
  }
}
