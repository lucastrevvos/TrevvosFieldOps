export const WORK_ORDER_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type WorkOrderPriority = (typeof WORK_ORDER_PRIORITIES)[number];

export interface CreateWorkOrderInput {
  address: { city: string; line1: string; postalCode: string; state: string };
  description?: string;
  priority: WorkOrderPriority;
  scheduledFor: string;
  title: string;
}

export interface CreatedWorkOrder {
  createdAt: string;
  id: string;
  status: 'PENDING_DISPATCH';
}

interface ProblemDetails {
  detail?: string;
  title?: string;
}

export class WorkOrderRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkOrderRequestError';
  }
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<CreatedWorkOrder> {
  const response = await fetch('/api/work-orders', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails;
    throw new WorkOrderRequestError(
      problem.detail ?? problem.title ?? 'The work order could not be created.',
    );
  }

  return response.json() as Promise<CreatedWorkOrder>;
}
