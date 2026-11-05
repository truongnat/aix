# Edge cases

See also — **`failure-modes-detection-mitigation.md`**.

- **`ATTACH DATABASE`** — Only trusted paths; user-supplied paths enable **symlink escape** / cross-db reads — **`failure-modes-detection-mitigation.md`**.
- **Concurrent writes** — SQLite serializes writes; **high** write concurrency → PostgreSQL or other server DB.
- **Network filesystems** — SQLite on **NFS** / some cloud mounts can corrupt; check docs.
- **Corrupt** DB — `PRAGMA integrity_check`; restore from backup if failed.
- **Time** in SQL — store **UTC**; document **timezone** in app layer.
