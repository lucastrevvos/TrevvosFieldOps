# ADR-0003: Deliver domain events at least once through a transactional outbox

- Status: Accepted
- Date: 2026-09-11
- Decision owners: Trevvos FieldOps maintainers
- Related Issue: #11

## Context

Creating a work order commits relational state and must trigger downstream preparation without
making the HTTP transaction depend on RabbitMQ availability. A database commit and a broker
publish cannot form one atomic transaction. RabbitMQ may also redeliver messages after consumer or
network failures.

## Decision

Write a versioned `WorkOrderCreated.v1` envelope to an outbox row in the same PostgreSQL transaction
as the work order and audit event. A separate worker claims unpublished rows, publishes persistent
messages with publisher confirms and marks them published afterwards.

Use at-least-once delivery. Consumers store each event identifier in PostgreSQL in the same
transaction as their business effect. Duplicate identifiers become successful no-ops. Preserve one
correlation identifier from HTTP creation through outbox, broker metadata and dispatch preparation.

Retry consumer failures twice through a delayed durable queue. A message that still fails is routed
to a durable dead-letter queue for inspection and controlled replay.

## Consequences

A crash after broker confirmation but before updating the outbox may publish a duplicate; consumer
idempotency makes that safe. Temporary outages do not roll back work-order creation. Delivery is
eventual, not immediate, and operators must monitor old outbox rows and dead-letter depth.

RabbitMQ is the local adapter. The versioned event contract, outbox and handler remain independent
so GCP Pub/Sub can replace only the transport adapter in the cloud deployment.
