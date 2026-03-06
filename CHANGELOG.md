# Changelog

All notable changes to this project are documented here.

## [1.1.0] - 2026-03-06

### Added
- New command: `workflow normalize-imported-skills` to enrich already-imported `SKILL.md` metadata (`risk`, `source`, `tags`) from lockfile provenance without re-pulling repositories.
- `normalize-imported-skills` supports `--dry-run`, `--json`, and local/global mode parity for safer rollout in CI and local validation.
- New MCP runtime management commands:
  - `workflow mcp-register <name>` (stdio/http/sse transport)
  - `workflow mcp-list`
  - `workflow mcp-ping [name] --timeout-ms <ms>`
- MCP registry persistence under `.agents/mcp/servers.json` with per-server allow/deny tool policy metadata and last-ping status tracking.
- Advanced scaffold defaults now include richer baseline package files:
  - non-empty rules (`runtime`, `branching`, `coding`, `merge`)
  - starter role files with explicit responsibilities
  - starter skills/workflows/templates with deterministic report gates.
- Workflow output quality gate skill `agent.report_quality_gate` added and wired into release/review/feature/bugfix/merge/refactor style workflows.

### Changed
- Package quality checks strengthened to flag sparse/empty rule, role, and skill content and to enforce report-quality conventions for internet-capable workflows.
- Core and domain workflow packs were upgraded with explicit `workflow_report` + `report_quality_gate` steps to prevent low-detail reporting.
- Role definitions were expanded across default and domain packs to be more specific and execution-oriented.
- Imported skill corpus under `.agents/skills/imported` was normalized for more consistent metadata and safer reuse.
- CLI run summaries for role/chat-thread flows now print per-step details (status, duration, actions, risks, provider/model, summary/error) for better traceability.
- `llm_subagent` provider routing now supports Anthropic and policy-based fallback behavior via `ANTIGRAV_LLM_FALLBACK_POLICY=transient_only|always|never`.

### Quality
- Test suite remains green with `cargo test` (`150 passed`), including new coverage for MCP registry/ping behavior and provider fallback policy.

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
- Deterministic workflow execution engine as the single runtime path.
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
- `--snapshot-out` ignored after engine consolidation.

### Quality
- `cargo fmt`, `cargo test`, and `cargo clippy --all-targets -- -D warnings` are clean in current workspace state.
