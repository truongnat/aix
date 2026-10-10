# PostgreSQL schema review matrix

| Review area | Check | Expected evidence |
|---|---|---|
| Grain/ownership | One row represents one clear entity/event; ownership and lifecycle stated | Table purpose and cardinality |
| Integrity | PK, FK, unique, check, nullability, delete/update behavior match domain | Constraint review and negative cases |
| Access paths | Real query filters, joins, sort, and tenant predicates have appropriate indexes | Query plan or measured workload |
| Time/money | Time zone and precision choices are explicit; money is exact | Type rationale and boundary case |
| Concurrency | Locking, MVCC, uniqueness race, and transaction boundary are considered | Concurrent scenario evidence |
| Growth | Partition/retention/TOAST/index growth assumptions are documented | Size projection and maintenance plan |
| Privacy | Sensitive columns classified, minimized, masked, and access-controlled | Data classification and audit path |
| Migration | Expand/contract and backfill path is compatible with live readers/writers | Migration sequence and rollback decision |

Reject schema changes justified only by convention; tie denormalization or an index to a measured access path and maintenance cost.
