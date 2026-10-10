# GraphQL execution and schema (system model)

## Request lifecycle (mental map)

```text
HTTP body → parse document → validate against schema → execute selection sets → serialize response
```

- **Validation** catches **static** issues (unknown fields, wrong types).
- **Execution** runs **resolvers** depth-first; errors can **bubble** via non-null rules — `**edge-cases.md`**.

## Schema as contract


| Artifact                | Role                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| **SDL / schema object** | Types, fields, directives — **public API** to clients                             |
| **Resolvers**           | Field-level behavior; **authZ** belongs here per field — `**tips-and-tricks.md`** |


## Root operation types

- **Query** — reads (typically parallel friendly).
- **Mutation** — serialized execution order **per spec** (single root mutation field sequencing rule — verify server impl).
- **Subscription** — long-lived; transport-specific — `**edge-cases.md`**.

## Graph shape vs storage shape

- **Domain-first types** — Avoid leaking SQL tables as 1:1 types unless intentional — `**decision-tree.md`**.

