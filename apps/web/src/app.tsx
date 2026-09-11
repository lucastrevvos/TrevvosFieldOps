import { useEffect, useState } from 'react';

import { getApiHealth } from './api/health';
import { WorkOrderForm } from './work-orders/work-order-form';

type ConnectionState = 'checking' | 'connected' | 'unavailable';

export function App() {
  const [connection, setConnection] = useState<ConnectionState>('checking');

  useEffect(() => {
    const controller = new AbortController();

    void getApiHealth(controller.signal)
      .then(() => setConnection('connected'))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setConnection('unavailable');
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Trevvos FieldOps home">
          <span className="brand-mark">TF</span>
          <span>Trevvos FieldOps</span>
        </a>
        <span className={`connection connection--${connection}`} role="status">
          <span className="connection-dot" aria-hidden="true" />
          {connection === 'checking' && 'Checking API'}
          {connection === 'connected' && 'API connected'}
          {connection === 'unavailable' && 'API unavailable'}
        </span>
      </header>

      <main>
        <WorkOrderForm />
      </main>
    </div>
  );
}
