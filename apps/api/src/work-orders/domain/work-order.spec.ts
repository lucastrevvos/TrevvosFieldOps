import { DomainValidationError, WorkOrder } from './work-order.js';

const validInput = {
  address: {
    city: 'Florianópolis',
    line1: 'Rua das Gaivotas, 120',
    postalCode: '88058-500',
    state: 'sc',
  },
  priority: 'HIGH' as const,
  scheduledFor: new Date('2026-10-20T13:30:00.000Z'),
  title: '  Inspect refrigeration unit  ',
};

describe('WorkOrder', () => {
  it('creates a pending work order with normalized values', () => {
    const workOrder = WorkOrder.create(validInput, new Date('2026-10-01T10:00:00.000Z'));
    const created = workOrder.toPrimitives();

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.status).toBe('PENDING_DISPATCH');
    expect(created.title).toBe('Inspect refrigeration unit');
    expect(created.address.state).toBe('SC');
  });

  it('rejects a schedule that is not in the future', () => {
    expect(() =>
      WorkOrder.create(
        { ...validInput, scheduledFor: new Date('2026-09-30T10:00:00.000Z') },
        new Date('2026-10-01T10:00:00.000Z'),
      ),
    ).toThrow(DomainValidationError);
  });
});
