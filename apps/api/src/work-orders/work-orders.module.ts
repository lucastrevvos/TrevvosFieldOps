import { Module } from '@nestjs/common';

import { DatabaseModule } from '../infrastructure/database/database.module.js';
import { CreateWorkOrder } from './application/create-work-order.js';
import { WORK_ORDER_REPOSITORY } from './application/work-order.repository.js';
import { PostgresWorkOrderRepository } from './infrastructure/postgres-work-order.repository.js';
import { WorkOrdersController } from './presentation/work-orders.controller.js';

@Module({
  controllers: [WorkOrdersController],
  imports: [DatabaseModule],
  providers: [
    CreateWorkOrder,
    {
      provide: WORK_ORDER_REPOSITORY,
      useClass: PostgresWorkOrderRepository,
    },
  ],
})
export class WorkOrdersModule {}
