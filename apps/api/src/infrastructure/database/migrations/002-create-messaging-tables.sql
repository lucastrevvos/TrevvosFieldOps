CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY,
  aggregate_id uuid NOT NULL,
  event_type varchar(120) NOT NULL,
  correlation_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_error text
);

CREATE INDEX IF NOT EXISTS outbox_events_pending_idx
  ON outbox_events (next_attempt_at, occurred_at)
  WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS consumed_events (
  event_id uuid PRIMARY KEY,
  consumer varchar(120) NOT NULL,
  consumed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispatch_jobs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  work_order_id uuid NOT NULL UNIQUE REFERENCES work_orders(id),
  status varchar(32) NOT NULL CHECK (status IN ('READY_FOR_DISPATCH')),
  correlation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
