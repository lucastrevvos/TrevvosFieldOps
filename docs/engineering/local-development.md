# Local development

## Prerequisites

- Git
- Node.js 24 LTS
- pnpm 11

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

| Command          | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `pnpm build`     | Build all workspace projects in dependency order |
| `pnpm lint`      | Run package lint tasks and verify formatting     |
| `pnpm typecheck` | Type-check every workspace project               |
| `pnpm test`      | Run all automated tests                          |
| `pnpm check`     | Run lint, type-check, tests and build            |
| `pnpm format`    | Apply repository formatting                      |
| `pnpm clean`     | Remove generated workspace artifacts             |

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
