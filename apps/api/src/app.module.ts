import { Module } from '@nestjs/common';

import { HealthController } from './health/health.controller.js';
import { WorkOrdersModule } from './work-orders/work-orders.module.js';

@Module({
  controllers: [HealthController],
  imports: [WorkOrdersModule],
})
export class AppModule {}
