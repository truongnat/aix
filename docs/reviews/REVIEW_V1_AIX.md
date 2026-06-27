# Code Review — `aix` v1 implementation

**Reviewed:** 2026-06-27
**Scope:** `aix/` monorepo (sub-agent output) vs `TASKS.md`, `DETAIL_DESIGN.md`, `BAO_CAO_HOP_NHAT.md`
**Decision:** **REQUEST CHANGES** — 1 CRITICAL (security), 4 HIGH (core deliverables incomplete / build gate red)

## Summary

The scaffolding is genuinely good: all 13 `@x/*` packages exist with files matching the design's file layout, the dependency DAG is respected, `turbo run build` is green (ESM + d.ts for 13/13), and the `@x/policy` redaction engine and `@x/compiler` idempotency/marker logic are real and well-built. **But the three things the design calls non-negotiable are missing or faked:** (1) redaction is never actually called before writes, (2) the mandatory Graph KB server is empty, and (3) the highest-leverage Phase 1 task — migrating skills into a single canonical `content/` — was never run, so the registry/compiler operate on no data. The guardrail `aix run` "human review" loop is a hardcoded auto-approve stub. This is a solid **skeleton at ~Phase 0–2 structural completeness**, not a working v1.

## Findings

### CRITICAL

**C1 — Redaction-before-write is not implemented (core security invariant violated).**
The design states this as the platform's central guarantee: §7.1 "kb-server **không bao giờ** nhận raw secret — `@x/memory` đã redact trước `push`"; §10/§5.1 "Mọi nội dung qua `@x/policy.redact` trước khi ghi"; T3.3 DoD; and the global "Done" rule.
- `grep -rn redact packages/memory packages/cli` → **0 hits**.
- `@x/memory/package.json` declares `@x/policy` as a dependency but **no source file imports it**.
- `MarkdownStore.push`, `KbStore.push`, and CLI `memory push` all serialize `rec.body` raw.
- Fix: introduce the composite `MemoryStore` that wraps both stores and runs `policy.redact()` on `body` (and on evidence) before `push`/file-write; wire it into `memory.ts` CLI and the guardrail loop. The redaction engine (`packages/policy/src/redact.ts`) is ready — it just isn't called.

### HIGH

**H1 — `services/kb-server` is empty (T3.2 not done).**
`find services/kb-server -type f` (excl. node_modules) → **0 files**. The mandatory ("bắt buộc") NestJS + Neo4j 5.26 + Meilisearch + Redis port, docker-compose, MasterGuard/ApiKeyGuard, and graph schema do not exist. Consequences: `@x/memory/KbStore` targets `http://.../api/v1/memory` on a server that can't start; `aix doctor`'s `localhost:4000/health` check always fails. Phase 3's "Graph KB lưu/đọc" DoD is unmet.

**H2 — Skill migration never run (T1.4) — Phase 1's highest-leverage deliverable has no data.**
`find content -name SKILL.md` → **0**, while `imports/` holds **204** source `SKILL.md`. No `catalog.json` was generated under `aix/`. `migrateSkills` is a library function but is **not wired to any CLI command** and was never executed. Net effect: `SkillRegistry.load(content)` finds nothing, `aix skills list` is empty, the compiler emits nothing real. The Phase 1 goal ("không còn skill trùng/đa-định-dạng; 1 registry truy vấn được") is structurally present but functionally empty.

**H3 — Typecheck (the documented CI gate) is red.**
`pnpm lint` (`tsc --noEmit`) fails: `@x/cli src/commands/eval.ts(31,20): error TS6133: 'suite' is declared but never read.` 12/13 packages pass. `tsup` build stays green because it doesn't enforce `noUnusedLocals`, so the green build masks a red typecheck. This violates T0.1 ("CI chỉ chạy lint + build") and the global DoD ("build … xanh"). One-line fix (drop/underscore the unused `suite`), but it means the gate was never actually run.

**H4 — Guardrail `aix run` is a stub, not human-in-the-loop.**
`packages/cli/src/commands/run.ts` hardcodes every phase answer to `'y'` and writes synthetic `"Approved by user: <phase>"` evidence. It never calls `@x/hitl`, `@x/prompt`, or `@x/policy`. Per §5.1 the guardrail mode is the product's headline (assemble prompt → run → evidence → HITL decision → guarded advance). As written it is an unattended auto-advance through the phase machine — the "với người duyệt" promise is not delivered.

### MEDIUM

**M1 — Engine nodes are placeholders (T5.2 "port 1:1" not met).** `coderNode` emits a hardcoded `// TODO: implement …` string; no model call, no port of the Python logic, reviewer scoring loop is nominal. The `ticket-plan` node from the spec node chain (`plan→rules→tasks→pick→ticket-plan→coder→reviewer`) is absent. `@langchain/langgraph` is wired, but behavior is mock.

**M2 — Root `pnpm doctor` script is broken.** `package.json`: `import('./packages/cli/dist/index.js').then(m => m.run?.(['doctor']))`. The CLI `index.ts` exports nothing (`dist/index.d.ts` is 13 bytes; `m.run` is `undefined`) and calls `program.parse(process.argv)` at import time, so this both no-ops and parses node's own argv. Use the `aix` bin (`aix doctor`) or export a `run()` from the CLI.

**M3 — `tsconfig.base.json` deviates from the contract.** Uses `module: ESNext` + `moduleResolution: bundler`; §0.1 and T0.1 require `module: NodeNext`. Works under tsup bundling but changes ESM import/resolution semantics vs. the documented Node-native target.

**M4 — CLI surface drift.** Spec is `aix eval <suite>`; impl is `aix eval run <suite>` + `aix eval list`, and the runner is a mock (`makeMockRunner`). Acceptable for v1 if intentional, but it diverges from §4.1.

### LOW

- **L1** — `(opts.kind as any)` casts in `cli/commands/memory.ts` violate the strict-typing convention (§0.3); validate with the `MemoryRecord['kind']` union instead.
- **L2** — `@x/context` ships `analyze.ts`/`engine.ts` instead of the spec's `flow.ts`/`api-contract.ts` (T4.1). Functionally folded in; note for traceability.
- **L3** — Working tree shows `deleted: imports/skills/dist/*` (build artifacts of an imported repo) — clean up or gitignore to reduce noise.

## Validation Results

| Check | Result |
|---|---|
| Build (`turbo run build`, tsup ESM+d.ts) | **Pass** (13/13) |
| Type check (`tsc --noEmit` via `lint`) | **Fail** (1 error, `@x/cli`) |
| Lint (no separate ESLint configured) | n/a (lint == tsc) |
| Tests | Skipped by design (decision #6) |
| `aix doctor` smoke | Fails (no kb-server; root script broken) |

## Phase / Task status (vs TASKS.md)

| Phase | State |
|---|---|
| 0 — monorepo bootstrap | Done (note M3: `module` not NodeNext) |
| 1 — registry/core/policy | Code present; **T1.4 migration not run (H2)**, catalog not generated |
| 2 — compiler/providers/install | Adapters + compiler present, markers + idempotency real; emits nothing (no content) |
| 3 — phase loop/kb-server/memory/hitl | **kb-server empty (H1)**, **redaction unwired (C1)**, guardrail faked (H4) |
| 4 — context/browser/preview | Packages build; not validated end-to-end |
| 5 — engine | Builds; **nodes are stubs (M1)** |
| 6 — prompt/evals/cleanup | Packages build; eval uses mock runner; typecheck red (H3) |

## Recommended fix order

1. **C1** — wire `policy.redact()` into the memory write path (composite `MemoryStore`).
2. **H3** — fix `eval.ts` and make `tsc --noEmit` part of the gate that's actually run.
3. **H2** — add `aix skills migrate` and run it to populate `content/skills/` + generate `catalog.json`.
4. **H1** — port `kb-server` (or, if descoped for v1, make `KbStore` degrade to markdown explicitly and update `doctor`/docs to say KB is optional).
5. **H4 / M1 / M2** — replace the guardrail/engine stubs with real flows; fix `pnpm doctor`.
