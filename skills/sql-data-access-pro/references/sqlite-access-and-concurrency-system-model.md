# SQLite — access, locking, and concurrency model

## Contents

1. [Single-file database](#single-file-database)
2. [Connections and isolation](#connections-and-isolation)
3. [Locking and WAL](#locking-and-wal)
4. [Readers and writers](#readers-and-writers)
5. [Why PostgreSQL exists](#why-postgresql-exists)

Official references: [SQLite locking](https://www.sqlite.org/lockingv3.html), [WAL mode](https://www.sqlite.org/wal.html), [Python sqlite3](https://docs.python.org/3/library/sqlite3.html).

---

## Single-file database

SQLite packs the **entire database** in one (or few) files on disk. **Trust the filesystem path** — anyone who can replace the file can change data — pair **`security-pro`** for sensitive workflows.

---

## Connections and isolation

Each **`connect()`** yields a connection with its own transaction scope. Default **autocommit** behavior differs by API — use **explicit transactions** for multi-statement atomicity — **`sqlite-and-stdlib.md`**.

---

## Locking and WAL

- **Rollback journal** vs **WAL** — WAL often improves **read/write** overlap but has operational implications (extra `-wal`/`-shm` files).
- **`database is locked`** — Writer held lock; long read transaction can block writers — **`failure-modes-detection-mitigation.md`**.

---

## Readers and writers

SQLite allows **multiple readers** or **one writer** at a time (WAL relaxes some overlap). **Many concurrent writers** → design hits a wall — **`decision-tree.md`** → **`postgresql-pro`**.

---

## Why PostgreSQL exists

When you need **server-side enforcement** (RLS), **replication**, **heavy write concurrency**, or **networked** clients sharing one logical DB, SQLite is the wrong primary store — **`sql-safety-and-postgresql-handoff.md`**.
