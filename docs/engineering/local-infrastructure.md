# Local infrastructure

Docker Compose provides the dependencies used by the applications during development. The
configuration is intentionally local-only: published ports bind to `127.0.0.1`, and the fallback
credentials are not suitable for shared or production environments.

## Services

| Service             | Local address            | Purpose                                 |
| ------------------- | ------------------------ | --------------------------------------- |
| PostgreSQL          | `localhost:5432`         | Transactional application data          |
| Redis               | `localhost:6379`         | Cache and short-lived coordination data |
| RabbitMQ            | `localhost:5672`         | Asynchronous messaging                  |
| RabbitMQ Management | `http://localhost:15672` | Local broker inspection UI              |

The default PostgreSQL and RabbitMQ username is `fieldops`; their default password is
`fieldops_local_only`. These values exist only to reduce local setup friction. Copy `.env.example`
to `.env` to change ports or credentials on your machine.

## Lifecycle

Start the services and wait for all healthchecks:

```bash
pnpm infra:up
```

Inspect their state or stream logs:

```bash
pnpm infra:status
pnpm infra:logs
```

Stop containers while retaining their data:

```bash
pnpm infra:down
```

PostgreSQL, Redis and RabbitMQ use named volumes, so their state survives routine container
recreation. To deliberately reset all local service data, run:

```bash
docker compose down --volumes
```

That reset is destructive and cannot recover the data stored in those volumes.

## Healthchecks

Compose checks PostgreSQL with `pg_isready`, Redis with `redis-cli ping`, and RabbitMQ with
`rabbitmq-diagnostics ping`. `pnpm infra:up` exits unsuccessfully if a service never becomes
healthy. Use `docker compose ps` and `docker compose logs <service>` to identify the failing
container.

## Troubleshooting

### A port is already allocated

Copy `.env.example` to `.env`, change the conflicting host port, and start the stack again. The
container-side ports remain unchanged.

### A service stays unhealthy

Inspect its health details and recent logs:

```bash
docker inspect --format '{{json .State.Health}}' trevvos-fieldops-postgres-1
docker compose logs --tail=100 postgres
```

Replace `postgres` with `redis` or `rabbitmq` when diagnosing another service.

### Credentials changed after the first start

Image initialization variables apply only when a new data directory is created. If the existing
local data is disposable, perform the destructive volume reset above and start again.
