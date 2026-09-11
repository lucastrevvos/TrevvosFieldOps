import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from './app';

const createdOrder = {
  createdAt: '2026-09-11T15:13:08.875Z',
  id: 'b5217c35-56ae-4319-90cb-8695045e5257',
  status: 'PENDING_DISPATCH',
};

function mockHealth(): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        service: 'trevvos-fieldops-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
      { status: 200 },
    ),
  );
}

function fillValidForm(): void {
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Inspect refrigeration unit' },
  });
  fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'HIGH' } });
  fireEvent.change(screen.getByLabelText('Schedule for'), {
    target: { value: '2099-10-20T13:30' },
  });
  fireEvent.change(screen.getByLabelText('Street address'), {
    target: { value: 'Rua das Gaivotas, 120' },
  });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Florianópolis' } });
  fireEvent.change(screen.getByLabelText('State'), { target: { value: 'sc' } });
  fireEvent.change(screen.getByLabelText('Postal code'), { target: { value: '88058-500' } });
}

describe('App', () => {
  afterEach(() => vi.restoreAllMocks());

  it('submits valid data and announces the created identifier', async () => {
    mockHealth();
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(createdOrder), { status: 201 }),
    );
    render(<App />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Create work order' }));

    expect(await screen.findByText('Work order created')).toBeVisible();
    expect(screen.getByText(createdOrder.id)).toBeVisible();
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      '/api/work-orders',
      expect.objectContaining({ method: 'POST' }),
    );
    const request = vi.mocked(globalThis.fetch).mock.calls.at(-1)?.[1];
    const requestBody = typeof request?.body === 'string' ? request.body : '';
    expect(JSON.parse(requestBody)).toMatchObject({
      address: { state: 'SC' },
      priority: 'HIGH',
      title: 'Inspect refrigeration unit',
    });
  });

  it('shows accessible field errors and focuses the first invalid field', async () => {
    mockHealth();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Create work order' }));

    const title = screen.getByLabelText('Title');
    expect(await screen.findByText('Enter at least 3 characters.')).toBeVisible();
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveFocus();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the form available and announces API failures', async () => {
    mockHealth();
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Database temporarily unavailable.' }), {
        headers: { 'Content-Type': 'application/problem+json' },
        status: 503,
      }),
    );
    render(<App />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Create work order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Database temporarily unavailable.');
    await waitFor(() => expect(screen.getByLabelText('Title')).not.toBeDisabled());
  });
});
