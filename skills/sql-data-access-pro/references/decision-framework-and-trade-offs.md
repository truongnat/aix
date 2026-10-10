# Decision framework and trade-offs (SQL data access)

## Contents

1. [SQLite vs server PostgreSQL](#sqlite-vs-server-postgresql)
2. [In-database vs export-then-analyze](#in-database-vs-export-then-analyze)
3. [stdlib sqlite3 vs heavier stacks](#stdlib-sqlite3-vs-heavier-stacks)
4. [Write path vs read-only analytics](#write-path-vs-read-only-analytics)

Pair with **`decision-tree.md`** for quick branches.

---

## SQLite vs server PostgreSQL

| Stay on **SQLite** | Move to **PostgreSQL** |
|--------------------|------------------------|
| Local tools, single-user scripts, embedded tests | Multi-tenant SaaS, RLS, replicas, many writers |

**Trade-off:** ops simplicity vs **concurrency and enforcement** — **`postgresql-pro`**.

---

## In-database vs export-then-analyze

| In-SQL aggregates | Export → pandas / Parquet |
|-------------------|---------------------------|
| Fits in memory, SQL-friendly stats | Heavy ML, complex cleaning — **`data-analysis-pro`** |

**Trade-off:** round-trip I/O vs **Python memory** for huge exports — **`performance-tuning-pro`** for churning large files.

---

## stdlib sqlite3 vs heavier stacks

| **`sqlite3` stdlib** | **SQLAlchemy / drivers** |
|----------------------|---------------------------|
| Scripts, teaching, minimal deps | ORM migrations, connection pools, multi-backend |

**Trade-off:** fewer deps vs **portability** features — stack skills (**`nestjs-pro`**) when in app server.

---

## Write path vs read-only analytics

Default **`mode=ro`** or URI `file:...?mode=ro` when **inspection-only** — prevents accidental schema/data damage — **`anti-patterns.md`**.
