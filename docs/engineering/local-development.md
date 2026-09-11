# Local development

## Prerequisites

- Git
- Node.js 24 LTS
- pnpm 11
- Docker Engine with Docker Compose v2

The repository includes `.nvmrc` and the exact package manager release in the root
`package.json`.

## First setup

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
```

If pnpm is already installed outside Corepack, confirm it satisfies the `engines.pnpm` range
before installing dependencies.

## Root commands

| Command           | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `pnpm build`      | Build all workspace projects in dependency order |
| `pnpm lint`       | Run package lint tasks and verify formatting     |
| `pnpm typecheck`  | Type-check every workspace project               |
| `pnpm test`       | Run the fast unit and component suites           |
| `pnpm test:all`   | Run unit and Docker-backed integration suites    |
| `pnpm check`      | Run lint, type-check, tests and build            |
| `pnpm format`     | Apply repository formatting                      |
| `pnpm clean`      | Remove generated workspace artifacts             |
| `pnpm infra:up`   | Start and await healthy local dependencies       |
| `pnpm infra:down` | Stop local dependencies without deleting data    |

## Run the applications

Start both development servers from the repository root:

```bash
pnpm dev
```

In another terminal, start the outbox publisher and event consumer:

```bash
pnpm messaging:worker
```

- Web: `http://localhost:5173`
- API health: `http://localhost:3000/api/health`
- Swagger UI: `http://localhost:3000/docs`

Vite proxies browser requests from `/api` to the local NestJS server. The browser therefore uses
the same relative API path that can later be routed by a production gateway.

Turborepo may collect anonymous usage telemetry. It can be disabled in a development or CI
environment according to its documented telemetry setting.

## Workspace layout

```text
apps/                 # User-facing applications and entry points
packages/             # Shared contracts and engineering configuration
services/             # Independently deployable services added when justified
```

The `services/` directory is intentionally absent until a product flow demonstrates a valid
service boundary.

## Internal dependencies

Internal packages use the `@trevvos-fieldops/*` namespace and must be referenced with pnpm's
`workspace:` protocol. This makes installation fail rather than silently downloading a package
with the same name from a registry.

## Environment variables

Copy `.env.example` only after an application documents the variables it needs. Never commit
the resulting `.env` file or real credentials.

See [local infrastructure](local-infrastructure.md) for service addresses, lifecycle commands,
persistence and troubleshooting.

After starting PostgreSQL, apply the database migration:

```bash
pnpm db:migrate
```

Create a work order after starting the API:

```bash
curl --request POST http://localhost:3000/api/work-orders \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "Inspect refrigeration unit",
    "description": "Unit is intermittently losing temperature.",
    "priority": "HIGH",
    "scheduledFor": "2026-10-20T13:30:00.000Z",
    "address": {
      "line1": "Rua das Gaivotas, 120",
      "city": "Florianópolis",
      "state": "SC",
      "postalCode": "88058-500"
    }
  }'
```

Use a future value for `scheduledFor`. A successful request returns `201 Created`, the generated
UUID, the creation timestamp and the initial `PENDING_DISPATCH` status.

With the messaging worker running, the committed outbox event is published to RabbitMQ and creates
one idempotent `READY_FOR_DISPATCH` job. Inspect broker queues at `http://localhost:15672`; poison
messages eventually appear in `dispatch.work-order-created.v1.dead`.

## Troubleshooting

### Wrong Node.js version

Run `nvm use` or install a supported Node.js 24 release.

### Wrong pnpm version

Use the release declared in `packageManager` or install a compatible pnpm 11 release.

### Stale task cache

Run:

```bash
pnpm clean
pnpm check
```

Correctness must never depend on an existing Turborepo cache.
