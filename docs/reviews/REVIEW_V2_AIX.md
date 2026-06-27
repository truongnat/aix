# Code Review — `aix` v2 (post-remediation)

**Reviewed:** 2026-06-27
**Scope:** verify remediation tasks R0–R9 from [REVIEW_V1_TASKS.md](./REVIEW_V1_TASKS.md); re-review against [DETAIL_DESIGN.md](./DETAIL_DESIGN.md) / [TASKS.md](./TASKS.md)
**Decision:** **REQUEST CHANGES** — 2 HIGH (1 explicit instruction not done, 1 functional gap), 2 MEDIUM. No CRITICAL — the v1 security hole is **resolved**.

## Summary

Real progress. The v1 **CRITICAL** (redaction never called) is genuinely fixed and verified — an existing memory file on disk shows `••••`, no secret leaked. The build/typecheck gate is green 13/13, the guardrail loop is now a real human-in-the-loop flow, the engine nodes are de-stubbed behind a provider abstraction, and the `NodeNext`/`doctor`/eval fixes all landed. **But two things block v2:** (1) `services/kb-server` was the one task you explicitly chose to do (Branch A) and it's still **empty**, and (2) the skill migration produced files that the registry rejects — **0 of 163 skills validate**, so the catalog is empty and Phase 1's "one queryable registry" goal is still unmet. Plus a new `.ai/.ai/memory` path bug.

## Remediation scorecard

| Task | Finding | Status | Evidence |
|---|---|---|---|
| R0 | H3 typecheck gate | ✅ Done | `pnpm lint --continue` → 13/13 successful |
| R1 | C1 redaction | ✅ Done & verified | `RedactedMemoryStore` wraps stores; on-disk memory file = `••••`, no leak |
| R2 | H2 skill migration | ⚠️ **Partial/broken** | 163 `SKILL.md` written, but **163 skipped / 0 valid**; `catalog.json` = `[]` |
| R3 | H1 kb-server | ❌ **Not done** | `services/kb-server` = 0 files (Branch A was chosen) |
| R4 | H4 guardrail | ✅ Done | `run.ts` uses `ClackHitlChannel`, `PromptAssembler`, `PolicyEngine`, `BudgetTracker`; no hardcoded `'y'` |
| R5 | M1 engine nodes | ✅ Mostly | `coder.ts` uses `RuntimeProvider` + prompts + `ticketPlans`; `ticket-plan.ts` added (still `MockRuntimeProvider`) |
| R6 | M2 doctor script | ✅ Done | root `doctor` = `node packages/cli/dist/index.js doctor` |
| R7 | M3 NodeNext | ✅ Done | `tsconfig.base.json` `module`/`moduleResolution` = `NodeNext`, lint still green |
| R8 | M4 eval surface | ✅ Mostly | `loadSuite` reads `.aix/evals/<suite>.json`; still `eval run <suite>` not `eval <suite>` |
| R9 | L1–L3 cleanups | ⚠️ Partial | not re-verified in depth; superseded by V2-M1 path bug |

## Findings

### HIGH

**V2-H1 — `services/kb-server` still not implemented (R3 / Branch A not done).**
You explicitly selected **Branch A** (full NestJS + Neo4j port). `find services/kb-server -type f` (excl. node_modules) → **0 files**. None of R3.1–R3.4 happened: no NestJS app, no `docker-compose.yml`, no Neo4j schema, no auth guards. `@x/memory/KbStore` still points at a server that can't start; `aix doctor`'s Neo4j check still fails. The mandatory Graph KB (DETAIL_DESIGN §7) remains absent. This is the single largest outstanding item and was the one explicitly greenlit for this round.

**V2-H2 — Skill migration output is non-conformant; registry loads 0 skills (R2 functionally incomplete).**
`content/skills/` now has 163 `SKILL.md`, but `aix skills list` reports **163 SKIP / 0 valid** and `catalog.json` is `[]`. Root cause: the migrator copied the *source* frontmatter verbatim (`name`, `description`, `license`, `metadata: …`) without mapping to the registry schema (§2.1):
- Missing required `x-kind` (and other `x-*` fields) → Zod error "Required".
- Several descriptions exceed 1024 chars → "description tối đa 1024 ký tự".

So the files exist but are invisible to the registry/compiler/prompt layers — Phase 1's goal ("1 registry truy vấn được") is still unmet. The migrator must (a) inject `x-kind`/`x-version`/`x-roles` (infer kind from source category per §2.4: domain←devkit, reference←system-design, process←harness), and (b) truncate/move long descriptions (e.g. full text → `metadata.short-description` or body).

### MEDIUM

**V2-M1 — `.ai/.ai/memory/` doubled-path bug (new).**
CLI builds the store with `createRedactedStore(join(cwd, '.ai'))`, and `MarkdownStore` then joins `MEMORY_DIR = '.ai/memory'` onto that base → records land in `.ai/.ai/memory/<id>.md` instead of the design's `.ai/memory/<id>.md` (§7.1). Confirmed on disk: `./.ai/.ai/memory/58a69824-….md`. Fix one side only: either pass `cwd` (not `cwd/.ai`) to `MarkdownStore`, or set `MEMORY_DIR = 'memory'`. Otherwise any consumer reading `.ai/memory` (incl. server-down fallback) misses the records.

**V2-M2 — Engine coder still uses `MockRuntimeProvider` (no real LLM).**
R5 added the right abstraction (`RuntimeProvider`, real system/user prompt assembly, `ticketPlans` wiring) — good. But `coderNode`/`reviewerNode` instantiate `new MockRuntimeProvider()`, so autonomous runs still produce mock output. Acceptable as a v1 placeholder *if intentional*, but it means `aix run --auto` is not yet end-to-end functional. Wire a real provider (or make it configurable) and confirm the reviewer ≥9/10 loop runs against real output.

### LOW

- **V2-L1** — `aix eval` surface still `eval run <suite>` vs spec §4.1 `eval <suite>`; `eval list` prints a static "(none configured)" instead of scanning `.aix/evals/`.
- **V2-L2** — `RedactedMemoryStore` redacts on read (`search`/`get`/`list`) too, which is defensive but redundant if writes are always redacted; harmless, just note.

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`, 13 pkgs) | **Pass** (13/13) |
| Build (`turbo run build`) | **Pass** (13/13) |
| Redaction smoke (on-disk memory) | **Pass** (`••••`, no leak) |
| `aix skills list` | **Fail** (0/163 valid, catalog empty) |
| kb-server `/health` | **Fail** (server doesn't exist) |
| Tests | Skipped by design (#6) |

## What changed since v1

- **Resolved:** C1 (redaction), H3 (typecheck gate), H4 (guardrail stub), M1 (engine stubs → provider abstraction), M2 (doctor), M3 (NodeNext).
- **Still open:** H1 (kb-server) → V2-H1; H2 (migration) → re-surfaced as V2-H2 (data now exists but invalid).
- **New:** V2-M1 (`.ai/.ai` path), V2-M2 (mock provider).

## Next round (v2 → v3) — fix order

1. **V2-H2** — fix the migrator's frontmatter mapping (inject `x-*`, cap description) and re-run `aix skills migrate --write`; gate = `aix skills validate` green + `catalog.json` non-empty. *(Highest leverage: unblocks registry/compiler/prompt.)*
2. **V2-H1** — actually execute R3.1–R3.4 (NestJS + Neo4j port from `imports/dev-memory`); gate = `docker compose up` + `aix doctor` "KB: connected" + push→search E2E.
3. **V2-M1** — fix the doubled `.ai/.ai` path (one-line) and migrate the stray existing record.
4. **V2-M2** — wire a real `RuntimeProvider` so `aix run --auto` is end-to-end.
5. **V2-L1** — align `aix eval <suite>` + make `eval list` scan the dir.
