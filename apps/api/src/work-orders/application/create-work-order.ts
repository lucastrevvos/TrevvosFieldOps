import { Inject, Injectable } from '@nestjs/common';

import type { CreateWorkOrderProps, WorkOrderProps } from '../domain/work-order.js';
import { WorkOrder } from '../domain/work-order.js';
import { WORK_ORDER_REPOSITORY, type WorkOrderRepository } from './work-order.repository.js';

@Injectable()
export class CreateWorkOrder {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly repository: WorkOrderRepository,
  ) {}

  async execute(input: CreateWorkOrderProps): Promise<WorkOrderProps> {
    const workOrder = WorkOrder.create(input);
    await this.repository.saveWithInitialAuditEvent(workOrder);
    return workOrder.toPrimitives();
  }
}
