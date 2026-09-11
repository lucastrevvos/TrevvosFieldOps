import type { WorkOrder } from '../domain/work-order.js';
import { CreateWorkOrder } from './create-work-order.js';
import type { WorkOrderRepository } from './work-order.repository.js';

class RecordingRepository implements WorkOrderRepository {
  saved: WorkOrder[] = [];

  saveWithInitialAuditEvent(workOrder: WorkOrder): Promise<void> {
    this.saved.push(workOrder);
    return Promise.resolve();
  }
}

describe('CreateWorkOrder', () => {
  it('persists exactly one valid work order', async () => {
    const repository = new RecordingRepository();
    const useCase = new CreateWorkOrder(repository);

    const result = await useCase.execute({
      address: {
        city: 'Florianópolis',
        line1: 'Rua das Gaivotas, 120',
        postalCode: '88058-500',
        state: 'SC',
      },
      priority: 'NORMAL',
      scheduledFor: new Date(Date.now() + 3_600_000),
      title: 'Inspect refrigeration unit',
    });

    expect(repository.saved).toHaveLength(1);
    expect(result.status).toBe('PENDING_DISPATCH');
  });

  it('does not persist an invalid work order', async () => {
    const repository = new RecordingRepository();
    const useCase = new CreateWorkOrder(repository);

    await expect(
      useCase.execute({
        address: { city: 'Florianópolis', line1: 'Street', postalCode: '88058-500', state: 'SC' },
        priority: 'NORMAL',
        scheduledFor: new Date(Date.now() - 1_000),
        title: 'Invalid schedule',
      }),
    ).rejects.toThrow('Scheduled time must be in the future.');
    expect(repository.saved).toHaveLength(0);
  });
});
