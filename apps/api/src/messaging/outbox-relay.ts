import type { OutboxStore } from './outbox-store.js';
import type { WorkOrderCreatedEvent } from './work-order-created.event.js';

export interface EventPublisher {
  publish(event: WorkOrderCreatedEvent): Promise<void>;
}

export class OutboxRelay {
  constructor(
    private readonly store: OutboxStore,
    private readonly publisher: EventPublisher,
  ) {}

  async publishBatch(): Promise<number> {
    const pending = await this.store.claimPending();
    for (const item of pending) {
      try {
        await this.publisher.publish(item.event);
        await this.store.markPublished(item.id);
      } catch (error) {
        await this.store.markFailed(item.id, error);
      }
    }
    return pending.length;
  }
}
