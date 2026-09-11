import { useEffect, useState } from 'react';

import { getApiHealth } from './api/health';

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
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Operations workspace</p>
          <h1 id="hero-title">Field work, clearly coordinated.</h1>
          <p className="hero-copy">
            Create service orders, dispatch the right professional and follow every operational
            transition from one reliable workspace.
          </p>
          <div className="hero-actions">
            <button type="button" disabled>
              Create work order
            </button>
            <span>First workflow coming in the next delivery.</span>
          </div>
        </section>

        <section className="capabilities" aria-label="Platform capabilities">
          <article>
            <span>01</span>
            <h2>Dispatch</h2>
            <p>Match incoming work with eligible field professionals.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Traceability</h2>
            <p>Keep every status transition and integration event auditable.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Reliability</h2>
            <p>Design for retries, duplicate delivery and observable failures.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
