# Decisions

> Store durable, project-level decisions here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Record only decisions that future planning, implementation, or verification work should recall.
- Prefer one entry per decision.
- Link related hazards, verification expectations, or follow-up work when relevant.

## Entry Template

### DECISION-000

- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded
- Area: runtime | docs | release | tooling
- Decision: one-sentence statement
- Rationale: what pain, constraint, or tradeoff this decision resolves
- Alternatives considered: rejected options and why they were not chosen
- Consequences: follow-on costs, migration impact, or rollback expectations
- What changes if revisited: migration cost, breaking surface, or rollback path
- Related hazards: `HAZARD-###`, if any
- Verification impact: what checks become required
- Follow-up: owner + next review date

## Recorded Decisions

### DECISION-001

- Date: 2026-06-09
- Topic: default phase chaining
- Decision: `harness-ship` with status `shipped` chains to `harness-remember` in the same turn by default.
- Rationale: ship and remember are adjacent handoff steps; stopping between them loses durable lessons.
- Opt-out: user requests ship-only, or ship status is `shipped-with-gaps` / `failed` / blocked.
- Reference: `docs/phase-discipline.md` — Default Phase Chaining

## Example

### DECISION-001

- Date: 2026-06-07
- Status: accepted
- Area: install
- Decision: Keep provider-specific entrypoints project-local instead of copying root-level command packs.
- Rationale: avoids stale duplicated surfaces and keeps uninstall predictable.
- Alternatives considered: keeping the flat-root fallback or provider-specific shims for backward compatibility.
- Consequences: install, update, and uninstall stay smaller, but manual fallback must stay AGENTS-based.
- What changes if revisited: install/update/uninstall contracts and docs must change together.
- Related hazards: `HAZARD-002`
- Verification impact: install smoke tests and package surface checks must pass.
- Follow-up: review after the next release cut.
