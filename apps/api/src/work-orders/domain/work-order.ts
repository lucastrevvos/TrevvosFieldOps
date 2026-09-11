import { randomUUID } from 'node:crypto';

export const WORK_ORDER_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type WorkOrderPriority = (typeof WORK_ORDER_PRIORITIES)[number];

export const WORK_ORDER_STATUSES = ['PENDING_DISPATCH'] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export interface WorkOrderAddress {
  city: string;
  line1: string;
  postalCode: string;
  state: string;
}

export interface CreateWorkOrderProps {
  address: WorkOrderAddress;
  description?: string;
  priority: WorkOrderPriority;
  scheduledFor: Date;
  title: string;
}

export interface WorkOrderProps extends CreateWorkOrderProps {
  createdAt: Date;
  id: string;
  status: WorkOrderStatus;
}

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export class WorkOrder {
  private constructor(private readonly props: WorkOrderProps) {}

  static create(input: CreateWorkOrderProps, now = new Date()): WorkOrder {
    const title = input.title.trim();
    const description = input.description?.trim();
    const address = {
      city: input.address.city.trim(),
      line1: input.address.line1.trim(),
      postalCode: input.address.postalCode.trim(),
      state: input.address.state.trim().toUpperCase(),
    };

    if (title.length < 3 || title.length > 120) {
      throw new DomainValidationError('Title must contain between 3 and 120 characters.');
    }
    if (description && description.length > 2_000) {
      throw new DomainValidationError('Description cannot exceed 2000 characters.');
    }
    if (Object.values(address).some((value) => value.length === 0)) {
      throw new DomainValidationError('Every address field is required.');
    }
    if (Number.isNaN(input.scheduledFor.getTime()) || input.scheduledFor <= now) {
      throw new DomainValidationError('Scheduled time must be in the future.');
    }

    return new WorkOrder({
      ...input,
      address,
      createdAt: now,
      description,
      id: randomUUID(),
      status: 'PENDING_DISPATCH',
      title,
    });
  }

  toPrimitives(): WorkOrderProps {
    return {
      ...this.props,
      address: { ...this.props.address },
      createdAt: new Date(this.props.createdAt),
      scheduledFor: new Date(this.props.scheduledFor),
    };
  }
}
