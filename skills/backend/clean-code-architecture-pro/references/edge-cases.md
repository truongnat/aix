# Clean code and architecture edge cases

## Premature abstraction

- Creating extra layers too early can increase cognitive load without reducing complexity.
- Generic "base" abstractions often force poor fit across domains and hide intent.

## Boundary erosion over time

- Quick fixes in deadlines can bypass use-cases and directly call infrastructure from domain paths.
- Shared helper modules can become implicit dependencies across unrelated contexts.

## Cyclic dependencies

- Feature modules that import each other usually signal missing orchestration layer or incorrect ownership.
- Breaking cycles may require extracting domain events or anti-corruption boundaries.

## Legacy migration traps

- Rewrites that skip parity checks can silently break edge-case behavior.
- Partial migrations can duplicate logic in old/new paths if ownership is unclear.

## Testing blind spots

- Integration tests alone may miss domain policy regressions.
- Unit tests with heavy mocks can pass while real wiring violates architecture boundaries.

## Organizational constraints

- Team topology can conflict with intended module ownership.
- Framework conventions may push code toward convenience over clean boundaries unless explicitly guarded.

---

## Distributed and scale-shaped edge cases

- **Microservices without bounded context** — Chatty networks; duplicated inconsistent models — prefer **modular monolith** until seams clear — **`bounded-context-and-strangler-patterns.md`**.
- **Shared database anti-pattern** — Multiple services writing same tables — coupling worse than monolith.

## Persistence and ORM

- **Active Record everywhere** — Entities know DB; hard to keep domain pure — gradual repository + mapping.
- **Read vs write models** — CQRS-lite: heavy queries don’t belong in aggregate APIs — separate read adapters.

## Events and async

- **Domain events as spaghetti bus** — Everything publishes; ordering unclear — explicit handlers + idempotency — **`deployment-pro`** / messaging skills when infrastructure-heavy.

## Frontend / API

- **Duplicated validation** — Client and server rules drift — share **contract** or accept server authority — **`api-design-pro`**.
- **Fat controllers** — HTTP layer contains business rules — thin controllers, fat use cases.

## Performance vs purity

- **Hot path allocation** — Pure domain objects fine; avoid abstract factory jungle in inner loop without measurement.

## Documentation debt

- **Diagram lies** — README layer chart ≠ imports — regenerate from **actual** dependency graph in CI.
