# PostgreSQL — MVCC, storage, and transaction model

## Contents

1. [Snapshots and row visibility](#snapshots-and-row-visibility)
2. [Writes and tuple versions](#writes-and-tuple-versions)
3. [Vacuum and bloat](#vacuum-and-bloat)
4. [Isolation in practice](#isolation-in-practice)
5. [WAL at a glance](#wal-at-a-glance)

Official source: [PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html) — confirm **major version** for planner and isolation nuances.

---

## Snapshots and row visibility

Each transaction sees a **consistent snapshot** of committed data as of snapshot acquisition time (details vary slightly by isolation level). Readers **do not block** writers on row locks the way some lock-based engines do; instead old row versions may remain until vacuum can reclaim them.

**Why it matters:** “Slow SELECT” can still drive **bloat** if paired with **churn** and **blocked vacuum** — **`edge-cases.md`**.

---

## Writes and tuple versions

`UPDATE` / `DELETE` create **new tuple versions**; old versions become dead rows until `VACUUM` (or autovacuum) can remove them if no transaction still needs them.

**Why it matters:** Hot wide rows + frequent updates → **write amplification** and **index maintenance** cost — **`schema-and-query-design.md`**.

---

## Vacuum and bloat

**Autovacuum** reclaims dead tuples and updates visibility map / freeze info. **Long transactions** (including idle-in-transaction) can hold back **xmin** and prevent aggressive cleanup → table/index bloat, **transaction id wraparound** pressure.

**Why it matters:** Operational tuning is as important as query tuning — **`failure-modes-detection-mitigation.md`**.

---

## Isolation in practice

| Level | Typical use |
|-------|-------------|
| **`READ COMMITTED`** (default) | Most OLTP; each statement sees latest committed rows |
| **`REPEATABLE READ`** | Stable read set for transaction; may need **retry** on serialization failure |
| **`SERIALIZABLE`** | Strongest invariants; more conflicts → **retries** |

Match isolation to **invariant** (e.g. balance transfer) not “strongest always” — **`decision-framework-and-trade-offs.md`**.

---

## WAL at a glance

Durability and replication are built on **write-ahead log**. Commit latency and replica lag correlate with WAL generation rate, sync policy, and network — pair **`deployment-pro`** for disk/replica topology; **`edge-cases.md`** for replica read consistency.
