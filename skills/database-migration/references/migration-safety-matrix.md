# Database migration safety matrix

| Change | Safe rollout pattern | Evidence |
|---|---|---|
| Add nullable column | Expand schema, deploy writer/reader, backfill, enforce constraint later | Compatibility and backfill metrics |
| Rename/remove column | Dual read/write or compatibility view, migrate consumers, remove last | Consumer inventory and absence proof |
| Add index/constraint | Build online where supported; assess lock and duplicate data | Lock/latency observation and validation |
| Transform data | Idempotent batches with checkpoints and reconciliation | Before/after counts and checksums |
| Large backfill | Throttle, pause/resume, monitor replica lag and load | Run ledger and abort trigger |
| Rollback | Reversible schema/data path or explicit forward-fix decision | Restore rehearsal and owner |

Required evidence: migration version, preconditions, lock/timeout policy, row counts, error/retry log, backup/restore point, compatibility window, and post-migration invariants. A down migration is not automatically a safe rollback for transformed data.
