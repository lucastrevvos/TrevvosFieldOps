import { render, screen } from '@testing-library/react';

import { App } from './app';

describe('App', () => {
  it('shows the operations shell and a connected API', async () => {
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

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Field work, clearly coordinated.' })).toBeVisible();
    expect(await screen.findByText('API connected')).toBeVisible();
  });
});
