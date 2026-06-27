# Quality validation and guardrails (SQL data access)

## Contents

1. [Path and trust](#path-and-trust)
2. [Anti-fabrication](#anti-fabrication)
3. [PII and exports](#pii-and-exports)
4. [Review checklist](#review-checklist)

---

## Path and trust

- Treat `.db` paths like **files with secrets** — resolve **absolute path**, avoid predictable locations in shared tmp.
- On **Windows**, mind locking + antivirus scanning causing **spurious** lock delays — document retries.

---

## Anti-fabrication

- **Do not invent** SQLite `PRAGMA` names, URI flags, or Python `sqlite3` kwargs — verify against [SQLite docs](https://www.sqlite.org/docs.html) and [Python docs](https://docs.python.org/3/library/sqlite3.html) for the user’s versions — **`versions.md`**.

---

## PII and exports

- CSV/Parquet exports can **leak PII** to less-controlled storage — redact columns; pair **`security-pro`**.

---

## Review checklist

- [ ] User-controlled **values** are bound parameters; **identifiers** are allowlisted or fixed.
- [ ] Read-only open when no writes; transactions explicit for multi-step writes.
- [ ] Locking / NFS / corruption risks called out when relevant — **`failure-modes-detection-mitigation.md`**.
- [ ] PostgreSQL-only features deferred with clear handoff — **`postgresql-pro`**.
