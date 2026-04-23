# Decision framework and trade-offs (PostgreSQL)

## Contents

1. [Normalization vs denormalization](#normalization-vs-denormalization)
2. [RLS vs application-only enforcement](#rls-vs-application-only-enforcement)
3. [Partitioning vs indexing](#partitioning-vs-indexing)
4. [Strong isolation vs retries](#strong-isolation-vs-retries)

Pair with **`decision-tree.md`** and **`schema-and-query-design.md`**.

---

## Normalization vs denormalization

| Lean normalized | Lean denormalized |
|-----------------|-------------------|
| Write-heavy, strong invariants, many updates to same fact | Read-heavy aggregates with stable access pattern |

**Trade-off:** denormalized caches need **update discipline** and often **triggers/jobs** to stay correct — document ownership.

---

## RLS vs application-only enforcement

| Prefer **RLS** | Prefer **app checks only** |
|----------------|----------------------------|
| Multi-tenant SaaS; defense in depth; compliance expects DB boundary | Single-tenant; trusted monolith; simpler ops |

**Trade-off:** RLS adds **planner cost** and **policy complexity** — index and test policies like code — **`row-level-security.md`**.

---

## Partitioning vs indexing

| Signal | Direction |
|--------|-----------|
| Pruning on time/tenant key; drop old ranges | **Partition** when maintenance wins are clear |
| Selective hot subset | **Partial index** first — often cheaper than full partition rollout |

**Trade-off:** partitions complicate **constraints**, **FKs**, and **global indexes** — validate operational runbooks — **`tips-and-tricks.md`**.

---

## Strong isolation vs retries

`SERIALIZABLE` / `REPEATABLE READ` reduce anomalies but **increase abort rate**. Prefer **`READ COMMITTED`** + explicit constraints when conflicts are rare and retries are expensive.

**Trade-off:** correctness proof vs **application retry** complexity — **`edge-cases.md`**.
