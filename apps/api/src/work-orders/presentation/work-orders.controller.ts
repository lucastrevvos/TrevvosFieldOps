import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

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
  constructor(private readonly createWorkOrder: CreateWorkOrder) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a field-service work order' })
  @ApiCreatedResponse({ type: CreatedWorkOrderResponse })
  async create(@Body() body: CreateWorkOrderDto): Promise<CreatedWorkOrderResponse> {
    const created: WorkOrderProps = await this.createWorkOrder.execute({
      address: body.address,
      description: body.description,
      priority: body.priority,
      scheduledFor: new Date(body.scheduledFor),
      title: body.title,
    });

    return {
      createdAt: created.createdAt.toISOString(),
      id: created.id,
      status: created.status,
    };
  }
}
