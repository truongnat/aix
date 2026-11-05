# Workflow and state-transition APIs

Business APIs are often **state machines**, not CRUD.

## Modeling

- Enumerate **states** and **legal transitions** per role.
- Expose **transition-oriented** endpoints where CRUD obscures intent:
  - `POST /orders/{id}/cancel`
  - `POST /payments/{id}/capture`

## Guards

- Return **409 Conflict** or domain error when transition illegal from current state.
- Include **machine-readable code** (`ORDER_ALREADY_SHIPPED`) for clients.

## Auditability

- Record **who**, **when**, **from→to state** — surface summary fields or companion audit API as needed.

## Vs generic PATCH

- Avoid “PATCH status field” without validation — centralize transition rules on action endpoints or explicit state engine.

## Review checklist

- [ ] Illegal transitions return **consistent** errors, not silent no-ops.
- [ ] Documentation lists **states** and **allowed actions** per state.
