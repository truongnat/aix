# Failure modes — detection and mitigation (SQLite / SQL data access)

## Contents

1. [Injection and dynamic SQL](#injection-and-dynamic-sql)
2. [Locking and concurrency](#locking-and-concurrency)
3. [Filesystem and integrity](#filesystem-and-integrity)
4. [Dialect and portability](#dialect-and-portability)

---

## Injection and dynamic SQL

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **String concatenation** with user input | `f"SELECT ... {x}"` | **Bound parameters** for **values**; **allowlist** for identifiers — **`sql-safety-and-postgresql-handoff.md`** |
| **Dynamic table/column names** | SQL built from form fields | Map to fixed identifiers or strict server-side allowlist — **`security-pro`** |

---

## Locking and concurrency

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **`database is locked`** | Retries, timeouts | Shorter transactions; WAL; reduce concurrent writers; or migrate — **`sqlite-access-and-concurrency-system-model.md`** |
| **Long read in write-heavy app** | Writers starved | `busy_timeout`; split read replica pattern → PG — **`edge-cases.md`** |

---

## Filesystem and integrity

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **NFS / network FS corruption** | Weird errors after deploy | Local disk or server DB — **`edge-cases.md`** |
| **Corrupt DB** | `integrity_check` fails | Restore backup; do not “patch” blindly — **`edge-cases.md`** |
| **`ATTACH` untrusted path** | Symlink / path escape | Only attach known paths; reject user paths — **`edge-cases.md`** |

---

## Dialect and portability

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **SQLite-only SQL on PG** | Migration fails | Translate types/functions early — **`sql-safety-and-postgresql-handoff.md`** |
| **Silent type coercion** | Different results on PG | Test both or pick one target — **`versions.md`** |
