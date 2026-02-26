# Changelog

All notable changes to this project are documented here.

## [1.0.1] - 2026-02-26

### Added
- Role-bound launch command: `workflow start-role <role> --task ...`.
- Chat-thread orchestration command: `workflow chat-thread <thread_id> --message ...` with optional merge phase.
- Graph context index builder: `workflow index-graph` writing `.agents/memory/graph_index.json`.
- Context retrieval modes `graph` and `hybrid` in addition to `vector|off`.
- Clean-clone smoke gate script: `scripts/smoke_clean_clone.sh` integrated into `scripts/ci_gate.sh`.
- Release template package file: `.agents/templates/release_prompt.md`.

### Changed
- Routing defaults now prefer the selected domain without restricting allowed domains by default.
- `workflow setup` now bootstraps memory indices:
  - `.agents/memory/vector_index.json`
  - `.agents/memory/graph_index.json`
- `workflow doctor` now checks memory index files and reports actionable warnings when missing.
- Merge policy model now supports:
  - `protected_branches`
  - `require_rebase_before_merge`
  and enforcement in `git_merge_branch`.

### Quality
- Test suite extended for role binding, chat intent routing, graph index build, routing policy defaults, and merge protected-branch policy.

## [1.0.0] - 2026-02-25

### Added
- Deterministic v2 execution engine as the single runtime path.
- Persisted workflow instances under `.agents/state` with structured step telemetry.
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
