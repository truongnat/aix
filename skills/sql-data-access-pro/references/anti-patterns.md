# SQL data access — anti-patterns

## String interpolation in SQL

- **SQL injection** risk.
- **Fix:** `?` / named placeholders always for external input.

## Assuming SQLite = Postgres

- Types, `ILIKE`, `JSONB`, `RETURNING` quirks differ.
- **Fix:** Document dialect; migrate queries when moving to **`postgresql-pro`**.

## Writable open for “read-only” scripts

- Accidental corruption or lock contention.
- **Fix:** Read-only connection mode when possible.

## Ignoring `database is locked`

- Retry storms or hidden partial failure.
- **Fix:** WAL awareness, timeout, backoff, or serialize writers.

## PII in exported CSV paths

- Compliance breach.
- **Fix:** Redact columns; secure output directory; **`security-pro`**.
