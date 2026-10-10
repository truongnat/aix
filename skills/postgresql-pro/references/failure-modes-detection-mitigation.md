# Failure modes — detection and mitigation (PostgreSQL)

## Contents

1. [Locks and migrations](#locks-and-migrations)
2. [RLS and visibility](#rls-and-visibility)
3. [Replication and pooling](#replication-and-pooling)
4. [Performance and plans](#performance-and-plans)
5. [Operational drift](#operational-drift)

---

## Locks and migrations

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Exclusive lock on hot table** | Writes stall during `ALTER` | Expand/migrate/contract; `CONCURRENTLY` indexes; short lock timeouts + retry — **`decision-tree.md`** |
| **Deadlock cycles** | `40P01` in logs | Consistent lock order; idempotent **retry** — **`edge-cases.md`** |
| **Blocked autovacuum** | Rising dead tuples, bloat | Kill long idle transactions; tune autovacuum — **`postgresql-mvcc-storage-and-transaction-system-model.md`** |

---

## RLS and visibility

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **No rows after enabling RLS** | App role `SELECT` empty | `CREATE POLICY` per command/role; remember default-deny for non-owner — **`row-level-security.md`** |
| **RLS predicate slow** | High CPU per row in `EXPLAIN` | Index columns in `USING` / `WITH CHECK`; simplify policies — **`row-level-security.md`** |
| **Superuser hides RLS bugs** | Works as admin, fails in prod | Test as **application role**; avoid `BYPASSRLS` on app users — **`anti-patterns.md`** |

---

## Replication and pooling

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Stale reads on replica** | User “just saved” sees old data | Session stickiness or read-after-write to primary; awareness of lag — **`edge-cases.md`** |
| **Prepared statements + transaction pool** | “prepared statement does not exist” | Session pool or disable server-side prepares where required — **`decision-tree.md`**, **`tips-and-tricks.md`** |
| **Session `SET` lost** | `current_setting` wrong under pooler | `SET LOCAL` in same transaction as queries; document pool mode — **`integration-map.md`** |

---

## Performance and plans

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Wrong plan after stats drift** | Sudden seq scans | `ANALYZE`; fix skewed stats; consider extended stats — **`tips-and-tricks.md`** |
| **N+1 at ORM layer** | Many identical queries | Batch / join; app change — **`nestjs-pro`**, **`performance-tuning-pro`** |

---

## Operational drift

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Dev ≠ prod extensions or version** | Works locally, fails in prod | Pin versions; migration checks — **`versions.md`**, **`quality-validation-and-guardrails.md`** |
