# Resource modeling and domain actions

Wrong resource shape causes more churn than wrong status codes. Model **nouns** (resources) and **verbs** (actions) deliberately.

## Aggregates and nesting

- **Aggregate root** — expose stable entry points; avoid arbitrarily deep `/a/b/c/d/e` trees.
- **Child collections** — `/parents/{id}/children` vs flat `/children?parent_id=` — pick one canonical pattern per relationship.
- **Avoid duplicate URLs** for the same entity — one canonical href; others redirect or deprecate.

## Identifiers

- **Public id** — opaque, stable (`uuid`, prefixed string); avoid sequential ints for guessability unless low risk.
- **Internal id** — never required for clients if it leaks enumeration or coupling.
- **Composite keys** — encode in path only when both dimensions are natural.

## Actions vs generic CRUD

- Not everything is PUT/PATCH — domain actions (**cancel**, **capture**, **approve**) often deserve **`POST .../actions/cancel`** or **`POST .../cancel`** with explicit body.
- Document **allowed transitions** vs forbidden states — pair with **`workflow-and-state-transitions.md`**.

## Bulk and long-running

- **Bulk** — partial success semantics (`207`, per-item errors); max batch size; idempotency per item or whole batch.
- **Long-running** — `202 Accepted` + **operation resource** — **`async-webhooks-and-jobs.md`**.

## Cross-resource consistency

- If writes span aggregates, define **compensating behavior**, **sagas**, or **eventual consistency** docs — **`consistency-and-conflicts.md`**.

## Review checklist

- [ ] Each exposed resource maps to a **domain concept**, not DB tables blindly.
- [ ] **Canonical URL** policy documented.
