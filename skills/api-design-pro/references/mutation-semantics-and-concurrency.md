# Mutation semantics and concurrency control

Precise HTTP verb semantics and **lost-update** defenses.

## Verb semantics

| Verb | Typical meaning | Notes |
|------|-----------------|-------|
| **POST** | Create subordinate resource or non-idempotent action | Require **Idempotency-Key** for billable/dedup-sensitive writes |
| **PUT** | Full replace of resource state at URI | Usually replace entire representation |
| **PATCH** | Partial update | Define merge vs replace-null semantics (**JSON Merge Patch** vs JSON Patch vs custom) |
| **DELETE** | Remove resource | **Soft delete** vs **hard delete** — document recovery and list visibility |

## Upsert

- **PUT** create-or-replace vs **PATCH** upsert — pick one; avoid ambiguous “works sometimes”.
- Keys for upsert uniqueness must be explicit.

## Soft delete

- Filter defaults (`include_deleted`); tombstone retention; purge jobs.

## Bulk mutation

- Atomic vs best-effort; reporting failed indices; **idempotency key** scope (batch vs item).

## Async mutation

- Return **`202`** + **`Location`** of operation/status resource — **`async-webhooks-and-jobs.md`**.

## Concurrency control

- **ETag** + **`If-Match`** / **`If-None-Match`** for optimistic locking.
- **Version field** in body for clients that cannot send headers consistently.
- Define behavior on **409 Conflict** vs **412 Precondition Failed**.

## Duplicate / replay

- **Idempotency-Key** scoped to **tenant + route + appropriate window**.
- Replay with **different body** same key → **409** or reject — document.

## Review checklist

- [ ] PATCH merge rules and **null** meaning are documented.
- [ ] Concurrent edit policy prevents silent **lost updates** where required.
