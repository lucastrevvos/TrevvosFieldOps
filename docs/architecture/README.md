# Architecture

## Initial target

The target architecture contains:

- React web application built with Vite
- NestJS API gateway
- Identity service
- Work Orders service
- Dispatch service
- Notification and Webhook service
- PostgreSQL for durable relational data
- Redis for ephemeral coordination and caching
- RabbitMQ locally and GCP Pub/Sub in cloud environments

## Evolution strategy

Services will be introduced through vertical product flows. A service exists only when its independent responsibility, data ownership or scaling characteristics justify the operational cost.

Synchronous REST communication is used when the caller needs an immediate result. Events are used for asynchronous workflows and integration reactions.

## Required engineering mechanisms

- Transactional outbox
- Idempotent consumers
- Retry with bounded exponential backoff
- Dead-letter handling
- Correlation identifiers
- Health, readiness and liveness checks
- Structured logging, metrics and distributed tracing

## Architecture Decision Records

Significant decisions use the [ADR template](adr/0000-template.md). An ADR describes context, options, consequences and status rather than merely stating the chosen technology.

| ADR                                                     | Decision                           | Status   |
| ------------------------------------------------------- | ---------------------------------- | -------- |
| [ADR-0001](adr/0001-monorepo-and-package-strategy.md)   | Use pnpm workspaces with Turborepo | Accepted |
| [ADR-0002](adr/0002-work-order-persistence-boundary.md) | Modular slice with explicit SQL    | Accepted |
| [ADR-0003](adr/0003-at-least-once-event-delivery.md)    | At-least-once outbox delivery      | Accepted |
