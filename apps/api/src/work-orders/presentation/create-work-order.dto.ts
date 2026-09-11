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
  @ApiProperty({ example: 'Rua das Gaivotas, 120', type: String })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  line1!: string;

  @ApiProperty({ example: 'Florianópolis', type: String })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'SC', type: String })
  @IsString()
  @Length(2, 2)
  state!: string;

  @ApiProperty({ example: '88058-500', type: String })
  @IsPostalCode('BR')
  postalCode!: string;
}

export class CreateWorkOrderDto {
  @ApiProperty({
    example: 'Inspect refrigeration unit',
    maxLength: 120,
    minLength: 3,
    type: String,
  })
  @IsString()
  @Length(3, 120)
  title!: string;

  @ApiPropertyOptional({
    example: 'Unit is intermittently losing temperature.',
    maxLength: 2000,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string;

  @ApiProperty({ enum: WORK_ORDER_PRIORITIES, example: 'HIGH', type: String })
  @IsIn(WORK_ORDER_PRIORITIES)
  priority!: WorkOrderPriority;

  @ApiProperty({
    example: '2026-10-20T13:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  @IsDateString({ strict: true })
  scheduledFor!: string;

  @ApiProperty({ type: () => WorkOrderAddressDto })
  @Type(() => WorkOrderAddressDto)
  @ValidateNested()
  address!: WorkOrderAddressDto;
}
