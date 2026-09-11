import type { WorkOrder } from '../domain/work-order.js';

export const WORK_ORDER_REPOSITORY = Symbol('WORK_ORDER_REPOSITORY');

export interface WorkOrderRepository {
  saveWithInitialAuditEvent(workOrder: WorkOrder, correlationId: string): Promise<void>;
}
