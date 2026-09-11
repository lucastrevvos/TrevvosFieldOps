# ADR-0002: Keep the first work-order slice modular and use explicit SQL

- Status: Accepted
- Date: 2026-09-11
- Decision owners: Trevvos FieldOps maintainers
- Related Issue: #6

## Context

The first business flow must create a work order, persist it in PostgreSQL and record an initial
audit event. The target architecture may later extract an independently deployable Work Orders
service, but no operational or scaling evidence currently justifies that boundary.

The implementation must also expose transaction behavior and preserve domain rules independently
from HTTP and database frameworks.

## Decision

Implement the first slice as a feature module inside the NestJS API. Separate it into domain,
application, presentation and infrastructure concerns:

- the domain creates identifiers, assigns the initial status and enforces invariants;
- the application use case depends on a repository interface;
- the presentation layer owns DTO validation and HTTP representation;
- the PostgreSQL adapter implements the repository with parameterized SQL.

Use the `pg` driver directly. Insert the work order and its initial audit event in the same
database transaction.

## Consequences

The domain can be tested without NestJS or PostgreSQL, persistence behavior remains visible, and
the module can be extracted later behind its existing application boundary. The tradeoff is that
the team owns SQL mapping and migration execution instead of delegating those concerns to an ORM.

Reconsider an ORM when query volume or mapping repetition produces measurable maintenance cost.
Reconsider service extraction when independent ownership, deployment, data ownership or scaling
requirements become concrete.
