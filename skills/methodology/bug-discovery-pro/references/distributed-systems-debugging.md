# Distributed systems debugging

Failures **between** services — graph shows **coupling**; traces show **behavior**.

## Microservices / boundaries

- **Contract drift** — Producer changed field; consumer strict parse — **`shape_check`**, **`api-design-pro`**.
- **API boundary bugs** — Wrong assumptions about **errors** (retry on **4xx**), **timeouts**, **partial JSON**.
- **Async jobs** — Job succeeds but **callback** fails; **status** endpoint lag vs reality — **`api-design-pro`** async patterns.

## Messaging

- **Duplicate delivery** — Idempotent consumers; **dedup** store by message id.
- **Reordering** — Partition key; **ordering** not global unless stated.
- **Poison message** — DLQ, replay tooling.

## Cross-service causality

- Service A **200** but B **failed** — log **distributed trace** linking both; verify **compensations**.

## Pairing with GitNexus

- **`api_impact`** — consumers of changed export.
- **`impact`** — shared libraries between services (monorepo).
