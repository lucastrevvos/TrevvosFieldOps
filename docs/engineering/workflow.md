# Engineering workflow

## Board states

| State | Meaning |
| --- | --- |
| Backlog | Captured but not yet prepared |
| Ready | Meets the Definition of Ready |
| In Progress | Active implementation; one owner |
| In Review | Pull Request open and awaiting review |
| Testing | Implementation complete; validation pending |
| Done | Acceptance criteria met and merged |

## Traceability chain

`Epic -> Issue -> Branch -> Commits -> Pull Request -> Tests -> ADR/Docs -> Release`

## Definition of Ready

An item is Ready when:

- its problem and outcome are clear;
- scope and out-of-scope are explicit;
- acceptance criteria are verifiable;
- dependencies are known;
- relevant architectural questions are identified;
- the work is small enough for one focused Pull Request.

## Definition of Done

An item is Done when:

- acceptance criteria are satisfied;
- relevant automated tests pass;
- build and static checks pass;
- API or operational documentation is current;
- architectural decisions are recorded when applicable;
- the Pull Request explains decisions, validation and problems;
- no secret or environment-specific value is committed;
- the change is merged and linked to its Issue.

## Working agreement

1. Select one Ready Issue.
2. Move it to In Progress.
3. Create a branch named after the Issue.
4. Implement in small coherent commits.
5. Record discoveries in the Issue or Pull Request.
6. Open a Pull Request and move to In Review.
7. Validate and move to Testing.
8. Merge only after the Definition of Done.
9. Close the Issue and move it to Done.

## Change types

- Epic
- Feature
- Technical task
- Bug
- Architecture
- Infrastructure
- Study
