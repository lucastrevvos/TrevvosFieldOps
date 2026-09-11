import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPostalCode,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { WORK_ORDER_PRIORITIES, type WorkOrderPriority } from '../domain/work-order.js';

export class WorkOrderAddressDto {
  @ApiProperty({ example: 'Rua das Gaivotas, 120' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  line1!: string;

  @ApiProperty({ example: 'Florianópolis' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'SC' })
  @IsString()
  @Length(2, 2)
  state!: string;

  @ApiProperty({ example: '88058-500' })
  @IsPostalCode('BR')
  postalCode!: string;
}

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Inspect refrigeration unit', minLength: 3, maxLength: 120 })
  @IsString()
  @Length(3, 120)
  title!: string;

  @ApiPropertyOptional({ example: 'Unit is intermittently losing temperature.', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string;

  @ApiProperty({ enum: WORK_ORDER_PRIORITIES, example: 'HIGH' })
  @IsIn(WORK_ORDER_PRIORITIES)
  priority!: WorkOrderPriority;

  @ApiProperty({ example: '2026-10-20T13:30:00.000Z', format: 'date-time' })
  @IsDateString({ strict: true })
  scheduledFor!: string;

  @ApiProperty({ type: WorkOrderAddressDto })
  @Type(() => WorkOrderAddressDto)
  @ValidateNested()
  address!: WorkOrderAddressDto;
}
