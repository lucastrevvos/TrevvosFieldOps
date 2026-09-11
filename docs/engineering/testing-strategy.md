# Automated testing strategy

## Purpose

Tests provide fast design feedback and evidence at the boundaries where failures matter. Coverage
is a supporting signal, not a substitute for meaningful assertions, production observability or
manual acceptance.

## Test pyramid and ownership

| Layer                      | Owner            | Tools                          | What belongs here                                               |
| -------------------------- | ---------------- | ------------------------------ | --------------------------------------------------------------- |
| Unit                       | Feature author   | Jest or Vitest                 | Domain rules, use cases, pure transformations and failure paths |
| Component                  | Frontend author  | Vitest + React Testing Library | User-visible behavior, accessibility and request states         |
| API integration            | Backend author   | Jest + Supertest               | Routing, validation, serialization and HTTP errors              |
| Infrastructure integration | Adapter author   | Jest + Testcontainers          | Real SQL, transactions, migrations and infrastructure contracts |
| Manual acceptance          | Product/reviewer | Browser + local stack          | The complete user workflow before merge                         |

Unit tests may use focused fakes or spies. Infrastructure tests must use the real dependency when a
double could hide SQL, transaction, protocol or version-specific behavior. Tests must control time
and inputs, isolate persisted state and avoid depending on execution order.

## Commands

```bash
pnpm test:unit
pnpm test:integration
pnpm test:all
pnpm test:coverage
pnpm check
```

`test:unit` is the fast default. `test:integration` includes HTTP integration tests and starts an
ephemeral PostgreSQL container, so Docker must be running. `test:all` is the clean-environment and
CI acceptance command. A failed assertion names the project and test through Jest/Vitest output.

## Coverage policy

Coverage reports are written to each application's `coverage/` directory. Initial thresholds are
30% branch/40% other metrics for the API and 70% for the web application, reflecting the current
vertical slice. New code must exercise important success and failure behavior; thresholds should
ratchet upward as coverage grows. A pull request must not add trivial assertions solely to increase
a percentage.

## Testcontainers decision

PostgreSQL fidelity matters for the work-order repository because it owns parameterized SQL and an
atomic work-order/audit-event transaction. Testcontainers therefore starts the same PostgreSQL
major version used locally. Redis and RabbitMQ containers will be introduced when production code
first depends on their protocol behavior, avoiding slow containers without a real integration seam.
