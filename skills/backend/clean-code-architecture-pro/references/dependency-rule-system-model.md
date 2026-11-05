# Dependency rule and system model

Clean Architecture is a **dependency discipline** on a **directed graph** — not only folder names.

## Dependency vs control flow

| Concept | Meaning |
|---------|---------|
| **Dependency** (compile/import time) | Inner layers **must not** reference outer layers’ concrete types or frameworks. |
| **Control flow** (runtime) | Calls may **start** at UI and **pass through** use cases into domain — allowed; dependencies stay inverted via interfaces. |

Outer layers **implement** ports that inner layers **define**.

## Canonical layers (conceptual)

```text
           Adapters (UI, HTTP, CLI)
                    │
           Application / use cases
                    │
              Domain (entities, policies)
                    │
        Infrastructure implements ports ──► (DB, queues, external APIs)
```

Exact folder names vary by stack; the **rule** is stable: **policy and entities** do not import drivers.

## Ports and adapters (hexagonal)

- **Port** — interface / contract owned by **application or domain** (language-dependent).
- **Adapter** — concrete implementation in outer ring (ORM repository, HTTP client).

## Data flow at boundaries

1. **Inbound** — Adapter parses transport → **DTO / command** → use case → domain.
2. **Outbound** — Use case invokes **port** → adapter talks to DB/API → maps to domain objects **inside** adapter (not leaking ORM entities inward).

## Consistency model (architectural)

- **Single bounded context** — one coherent domain model per module; don’t merge conflicting language without **ACL** — **`bounded-context-and-strangler-patterns.md`**.

## State

- **Domain state** — invariants enforced in entities/value objects.
- **Transactional boundary** — usually at **use case** level; infrastructure begins/commits transactions in adapter when that’s your pattern.
