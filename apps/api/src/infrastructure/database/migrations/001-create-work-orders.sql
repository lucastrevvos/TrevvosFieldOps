CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY,
  title varchar(120) NOT NULL,
  description varchar(2000),
  priority varchar(16) NOT NULL CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status varchar(32) NOT NULL CHECK (status IN ('PENDING_DISPATCH')),
  scheduled_for timestamptz NOT NULL,
  address_line1 varchar(180) NOT NULL,
  address_city varchar(100) NOT NULL,
  address_state char(2) NOT NULL,
  address_postal_code varchar(9) NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aggregate_type varchar(80) NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type varchar(120) NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_events_aggregate_idx
  ON audit_events (aggregate_type, aggregate_id, occurred_at);
