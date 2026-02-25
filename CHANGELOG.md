# Changelog

All notable changes to this project are documented here.

## [1.0.0] - 2026-02-25

### Added
- Deterministic v2 execution engine as the single runtime path.
- Persisted workflow instances under `.agent/state` with structured step telemetry.
- Deterministic `trace_id` generation and trace export (`--json`, `--timeline`).
- Concurrency protection with repo/workflow lock files and stale-lock reclaim.
- Idempotency short-circuit contract (`detect_already_applied`) for eligible skills.
- Runtime hardening for `run_script` (allowlist/denylist, shell-operator policy, dangerous pattern blocking, repo-root working dir pinning, cleared environment).

### Changed
- CLI workflow control path standardized around `workflow list|status|resume|abort|trace`.
- Session summary now includes branch, workflow count, adapter model/provider, and vector index handle.
- Workflow shorthand `write_files` default payload no longer embeds placeholder TODO text.

### Deprecated
- `--replay` removed from active execution flow (returns deprecation error).
- Snapshot `--resume` path removed from active execution flow (returns deprecation error).
- `AGENT_ENGINE=v1` ignored with warning; v2 is enforced.
- `--snapshot-out` ignored in v2.

### Quality
- `cargo fmt`, `cargo test`, and `cargo clippy --all-targets -- -D warnings` are clean in current workspace state.
