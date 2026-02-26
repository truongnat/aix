# Dev OS Blueprint

This document converts product vision into an executable engineering plan.

## Scope

Target: evolve from deterministic workflow runtime to an AI-native solo developer operating system, while preserving deterministic/safe execution guarantees.

## Non-Goals

- Build a distributed orchestration cluster.
- Build a hosted SaaS control plane in this cycle.
- Replace git with custom VCS logic.
- Allow autonomous agents to bypass runtime policy/lock/trace paths.

## Architecture Layers

### Layer 1: Deterministic Runtime

Current status: implemented.

Acceptance criteria:
- Same workflow definition produces same `trace_id`.
- Resume after forced interruption preserves step ordering and terminal state determinism.
- `cargo test` and `cargo clippy --all-targets -- -D warnings` pass on release branch.

### Layer 2: Agent Orchestration

Scope:
- role profiles (`architect`, `implementer`, `reviewer`)
- bounded sub-agent execution through runtime only
- deterministic role-to-skill invocation mapping

Acceptance criteria:
- No direct sub-agent side effects outside skill/runtime path.
- Role invocation is traceable as workflow steps.
- Denied skill permissions are rejected before execution.

### Layer 3: Domain Package System

Scope:
- project-local packages under `.agents/` (workflows, skills, rules, templates)
- markdown-only definitions for portability and reviewability

Acceptance criteria:
- Fresh clone can execute default workflows without YAML conversion.
- Missing/invalid package files fail with actionable diagnostics.
- Domain package changes are versioned and diff-friendly.

### Layer 4: Context Service (Vector + Graph)

Scope:
- retrieval layer for planning context
- separation from runtime state machine

Acceptance criteria:
- Retrieval latency stays within configured budget.
- Runtime determinism is unaffected when context service is unavailable (degrade gracefully).
- Context injection is explicit in trace/log output.

### Layer 5: Multi-Thread GitOps

Scope:
- thread -> deterministic branch mapping
- merge and conflict-analysis workflows with policy gates

Acceptance criteria:
- Each thread resolves to stable branch naming under policy prefix.
- Merge workflow enforces validation gate before success state.
- Conflict-analysis output is persisted in trace/results.

## Release Gates

### Gate A: Runtime Integrity

- deterministic replay tests green
- idempotency short-circuit tests green
- lock contention and stale-lock tests green

### Gate B: Safety Integrity

- command policy deny tests green
- trust-tier boundary tests green
- no unsafe bypass path from orchestration to shell execution

### Gate C: Product Integrity

- docs updated (`ARCHITECTURE`, `CLI_USAGE`, `CHANGELOG`, this blueprint)
- template workflows load and run in a clean clone

## 12-Month Execution Plan

### M1-M2: Orchestration v0.1

- introduce role registry
- bind role -> workflow template dispatch
- enforce runtime-only execution boundary

Exit criteria:
- role-based workflow start command available
- full trace visibility for role tasks

### M3-M4: Package Standardization

- package schema docs and validation rules
- package lint/check command
- migration tooling for older package layouts

Exit criteria:
- package check reports actionable errors
- default package set passes checks on CI

### M5-M7: Context Service v0.1

- unify vector retrieval interface
- add graph relation primitives for code artifacts
- context budget controls (query size/time)

Exit criteria:
- planner can consume context service optionally
- runtime remains deterministic with context disabled

### M8-M10: Multi-Thread GitOps v0.1

- branch orchestration improvements
- merge/conflict workflow hardening
- policy hooks for protected branches

Exit criteria:
- thread lifecycle flows: create -> implement -> merge -> close

### M11-M12: Hardening and vNext Release

- performance pass for large repositories
- failure-mode drills and recovery playbooks
- release criteria review and version bump

Exit criteria:
- no P0/P1 stability issues in release window
- release checklist fully satisfied

## Risk Register

### Risk 1: Determinism Erosion

Cause: hidden nondeterministic context mutation.

Mitigation:
- keep context service read-only from runtime perspective
- include deterministic fingerprinting in traces

### Risk 2: Agent Privilege Creep

Cause: sub-agents invoking unrestricted commands.

Mitigation:
- all execution through skill capability gates
- denylist/allowlist policy with strict default

### Risk 3: Complexity Explosion

Cause: parallel feature expansion across all layers.

Mitigation:
- one active layer milestone at a time
- explicit non-goals per quarter

### Risk 4: Adoption Friction

Cause: package format inconsistency and unclear defaults.

Mitigation:
- markdown-only package model
- starter templates + check command + migration docs

## Immediate Backlog (Next 2 Weeks)

1. Add role registry and role-bound workflow launch path.
2. Add package validator command (`workflow check`).
3. Add explicit context-service boundary interface (no runtime coupling).
4. Add CI gate script for release checklist verification.
