# SQL data access — versions

## Python `sqlite3`

- Bundled with CPython; **URIs** and some PRAGMA behavior depend on **SQLite library version** linked into Python.
- Check `sqlite3.sqlite_version` at runtime when using newer features.

## SQLite file format

- Very backward compatible; still verify **encryption extensions** (SQLCipher) separately if used.

## Handoff to PostgreSQL

- Note **type** mapping (`INTEGER` vs `BIGSERIAL`, booleans, timestamps with time zone).
