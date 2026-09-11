import type { EventPublisher } from './outbox-relay.js';
import { OutboxRelay } from './outbox-relay.js';
import type { ClaimedOutboxEvent, OutboxStore } from './outbox-store.js';
import {
  WORK_ORDER_CREATED_EVENT,
  type WorkOrderCreatedEvent,
} from './work-order-created.event.js';

const event: WorkOrderCreatedEvent = {
  correlationId: 'c0a80121-7ac0-4cae-8f91-62c439e8369d',
  data: {
    priority: 'HIGH',
    scheduledFor: '2099-10-20T13:30:00.000Z',
    status: 'PENDING_DISPATCH',
    title: 'Inspect refrigeration unit',
    workOrderId: 'b5217c35-56ae-4319-90cb-8695045e5257',
  },
  eventId: '5f325c2c-bd3b-4d46-98ec-c349d2544021',
  occurredAt: '2026-09-11T15:13:08.875Z',
  type: WORK_ORDER_CREATED_EVENT,
};

class RecordingStore {
  failed: string[] = [];
  published: string[] = [];

  claimPending(): Promise<ClaimedOutboxEvent[]> {
    return Promise.resolve([{ attempts: 1, event, id: event.eventId }]);
  }
  markFailed(id: string): Promise<void> {
    this.failed.push(id);
    return Promise.resolve();
  }
  markPublished(id: string): Promise<void> {
    this.published.push(id);
    return Promise.resolve();
  }
}

describe('OutboxRelay', () => {
  it('marks a broker-confirmed event as published', async () => {
    const store = new RecordingStore();
    const publisher: EventPublisher = { publish: () => Promise.resolve() };
    await new OutboxRelay(store as unknown as OutboxStore, publisher).publishBatch();
    expect(store.published).toEqual([event.eventId]);
    expect(store.failed).toEqual([]);
  });

  it('releases a failed publication for retry', async () => {
    const store = new RecordingStore();
    const publisher: EventPublisher = { publish: () => Promise.reject(new Error('broker down')) };
    await new OutboxRelay(store as unknown as OutboxStore, publisher).publishBatch();
    expect(store.failed).toEqual([event.eventId]);
    expect(store.published).toEqual([]);
  });
});
