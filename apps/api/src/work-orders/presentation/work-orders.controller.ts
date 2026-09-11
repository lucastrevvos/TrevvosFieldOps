import { randomUUID } from 'node:crypto';
import { Body, Controller, Headers, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { CreateWorkOrder } from '../application/create-work-order.js';
import type { WorkOrderProps } from '../domain/work-order.js';
import { CreateWorkOrderDto } from './create-work-order.dto.js';

class CreatedWorkOrderResponse {
  @ApiProperty({ format: 'uuid', type: String })
  id!: string;

  @ApiProperty({ example: 'PENDING_DISPATCH', type: String })
  status!: string;

  @ApiProperty({ format: 'date-time', type: String })
  createdAt!: string;
}

@ApiTags('work-orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(@Inject(CreateWorkOrder) private readonly createWorkOrder: CreateWorkOrder) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a field-service work order' })
  @ApiBody({ type: CreateWorkOrderDto })
  @ApiCreatedResponse({ type: CreatedWorkOrderResponse })
  async create(
    @Body() body: CreateWorkOrderDto,
    @Headers('x-correlation-id') suppliedCorrelationId?: string,
  ): Promise<CreatedWorkOrderResponse> {
    const correlationId = suppliedCorrelationId?.match(/^[0-9a-f-]{36}$/i)
      ? suppliedCorrelationId
      : randomUUID();
    const created: WorkOrderProps = await this.createWorkOrder.execute(
      {
        address: body.address,
        description: body.description,
        priority: body.priority,
        scheduledFor: new Date(body.scheduledFor),
        title: body.title,
      },
      correlationId,
    );

    return {
      createdAt: created.createdAt.toISOString(),
      id: created.id,
      status: created.status,
    };
  }
}
