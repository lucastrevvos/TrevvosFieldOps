# ADR-0001: Use pnpm workspaces with Turborepo

- Status: Accepted
- Date: 2026-09-11
- Decision owners: Trevvos FieldOps maintainers
- Related Issue: #8

## Context

Trevvos FieldOps will contain a React/Vite web application, NestJS services and shared engineering packages. The repository must support a consistent developer experience, isolated application ownership, reusable configuration and efficient CI execution without hiding the underlying Node.js tooling.

The first development cycle needs a lightweight foundation. The target architecture can grow into distributed services, but creating operational complexity before validating product boundaries would reduce learning clarity and delivery speed.

## Decision drivers

- Native support for multiple Node.js/TypeScript applications
- Strict and predictable dependency declarations
- Fast local and CI installations
- Shared scripts without copying configuration
- Dependency-aware build, lint and test execution
- Incremental adoption with little framework lock-in
- Compatibility with NestJS, React, Vite, Jest/Vitest and Docker
- Clear visibility into how the tooling works

## Considered options

### 1. npm workspaces without a task orchestrator

Advantages:

- Ships with npm
- Minimal additional tooling
- Familiar to most Node.js developers

Disadvantages:

- Does not provide a complete dependency-aware task graph by itself
- Requires more custom scripting as the number of applications grows
- Dependency isolation is less strict than the selected approach

### 2. pnpm workspaces without a task orchestrator

Advantages:

- Efficient content-addressable dependency storage
- Strict dependency resolution
- Native workspace support

Disadvantages:

- Cross-package task ordering and caching would require custom scripts
- CI optimization would need additional implementation

### 3. pnpm workspaces with Turborepo

Advantages:

- Keeps package management and task orchestration as separate concerns
- Provides a dependency-aware task graph and caching
- Requires little repository-specific abstraction
- Can be introduced gradually
- Leaves standard package scripts visible and directly executable

Disadvantages:

- Adds another tool and configuration file
- Remote caching requires additional setup
- Architectural boundaries still depend on repository conventions and tests

### 4. Nx

Advantages:

- Rich generators, dependency graph and affected-project commands
- Strong plugin ecosystem
- Can enforce module boundaries

Disadvantages:

- Adds a broader framework and more repository-specific concepts
- Provides more capability than the first development cycle needs
- Risks shifting study effort from Node.js fundamentals to Nx conventions

## Decision

Use **pnpm workspaces** for package management and **Turborepo** for task orchestration.

The initial layout will be:

```text
apps/
  api/
  web/
packages/
  contracts/
  eslint-config/
  typescript-config/
services/
  # Introduced only when a validated boundary is extracted
```

Rules:

1. Applications are independently runnable and deployable.
2. Shared packages contain contracts or cross-cutting configuration, not business-domain ownership.
3. Domain logic stays with the application or service that owns it.
4. Packages declare every direct dependency they import.
5. Root scripts delegate to Turborepo; package scripts remain runnable directly.
6. Services are added through vertical product flows, not generated in advance.
7. Internal packages use the `@trevvos-fieldops/*` namespace.
8. Dependency versions are kept consistent through the workspace catalog or root policy selected during bootstrap.
9. CI may use task caching, but builds must remain correct with an empty cache.

## Consequences

### Positive

- Installation is space-efficient and dependency declarations remain explicit.
- Developers can run one command for repository-wide build, lint and test tasks.
- CI can execute only the affected dependency graph as the repository grows.
- The approach remains close to standard Node.js package scripts.
- The repository can evolve from two applications to several deployable services.

### Negative

- Contributors must install and understand pnpm and Turborepo.
- Hoisting assumptions from npm-based projects may surface as dependency errors.
- Turborepo does not enforce domain boundaries automatically.
- Workspace-wide version policy must be maintained deliberately.

## Validation

The decision is validated when:

- a clean checkout installs dependencies with one documented command;
- root build, lint and test commands run packages in dependency order;
- the NestJS API and React/Vite web application build independently;
- changes to a shared package invalidate the correct dependent tasks;
- Docker builds do not depend on undeclared or globally installed packages;
- CI succeeds with caching disabled.

Revisit this ADR if repository scale requires stronger automated module-boundary enforcement, independent versioning becomes necessary or task-graph maintenance becomes opaque.

## References

- Issue #8
- Issue #3: Bootstrap the TypeScript monorepo
