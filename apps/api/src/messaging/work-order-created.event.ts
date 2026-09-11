export const WORK_ORDER_CREATED_EVENT = 'WorkOrderCreated.v1';

export interface WorkOrderCreatedEvent {
  correlationId: string;
  data: {
    priority: string;
    scheduledFor: string;
    status: 'PENDING_DISPATCH';
    title: string;
    workOrderId: string;
  };
  eventId: string;
  occurredAt: string;
  type: typeof WORK_ORDER_CREATED_EVENT;
}
