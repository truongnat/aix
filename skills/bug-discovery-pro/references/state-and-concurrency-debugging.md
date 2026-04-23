# State and concurrency debugging

Hardest class — **non-deterministic** unless you force ordering.

## Patterns

- **Race** — Last write wins on shared mutable state; **DB** row updated without version check.
- **Deadlock / lock ordering** — Consistent lock acquisition; timeouts reveal **blocked** threads.
- **Ordering** — Message handled before prerequisite; **out-of-order** webhook delivery.
- **Async inconsistency** — UI assumes **await** ordering; promise **fire-and-forget** error swallowed.
- **Retry duplication** — At-least-once + non-idempotent handler — **`failure-modes.md`**.
- **Eventual consistency** — Read-after-write violated; user sees stale read — **`distributed-systems-debugging.md`**.

## Tactics

- **Stress** / **timing** tests; **-race** detectors (Go), TS strict async review.
- **Structured concurrency** logs — acquire order, lock id.
- Reduce **critical section** scope; **optimistic concurrency** (version column, **ETag**).

## Graph role

GitNexus finds **shared writers**; **does not** prove races — combine with runtime evidence.
