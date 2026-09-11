# Initial product backlog

This document is the roadmap index. Executable work is created as GitHub Issues when it becomes close enough to implementation.

| Epic                                | Outcome                                      | Job requirements demonstrated                |
| ----------------------------------- | -------------------------------------------- | -------------------------------------------- |
| E0 - Engineering foundation         | Reproducible monorepo and working agreements | Git, GitHub, design decisions                |
| E1 - Identity and tenancy           | Secure organizations, users and roles        | NestJS, React Context, REST, security        |
| E2 - Work order management          | Create and manage field-service orders       | TypeScript, PostgreSQL, Swagger, tests       |
| E3 - Dispatch                       | Match and safely assign professionals        | distributed systems, concurrency, Redis      |
| E4 - Event backbone                 | Reliable asynchronous workflows              | RabbitMQ, Pub/Sub, outbox, idempotency       |
| E5 - Notifications and integrations | Deliver notifications and signed webhooks    | complex integrations, retry, circuit breaker |
| E6 - Operational dashboard          | Monitor live operational state               | React, Hooks, RTL, performance               |
| E7 - Observability and reliability  | Diagnose behavior across services            | logs, metrics, traces, health checks         |
| E8 - Delivery platform              | Automated build, test and deployment         | Docker, GitLab CI, Cloud Run                 |
| E9 - Scale laboratory               | Exercise resilience and orchestration        | Kubernetes, load tests, autoscaling          |

## First delivery sequence

1. Project governance and initial backlog
2. ADR: monorepo and package strategy
3. Bootstrap TypeScript monorepo
4. Bootstrap NestJS API and React/Vite web
5. Create local Docker Compose environment
6. Deliver the first vertical slice: create a work order
7. Add automated unit and integration tests
8. Publish and consume the first domain event
9. Deploy the vertical slice to GCP Cloud Run
10. Add Kubernetes deployment alternative

## Backlog policy

Only near-term items become detailed Issues. This avoids pretending that distant work is already understood. Each completed vertical slice informs refinement of the next items.
