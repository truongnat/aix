# Discussion

## Context (Round 1 — shipped)

Gap review (2026-06-10) items C1–C6, L1–L3 closed in PLAN-001. Verified and shipped; changes uncommitted on `main`.

## Round 2 — new gaps from gap review follow-up

The gap report now includes a Round 2 section reviewing the shipped fixes. Five follow-up items:

| ID | Severity | Summary |
|----|----------|---------|
| N1 | 🔴 | `run-with-active-session.js` regex expects backtick-wrapped session; `session:` field → four Claude hooks silently no-op |
| N2 | 🔴 | Codex router runs file guards on all tools with `path` — Read/Grep/Glob denied out-of-scope |
| N3 | 🟠 | `guardTestFirst` hard deny blocks routine edits when tests have only positive assertions |
| N4 | 🟡 | `--skip-demo-eval` removal undocumented in release notes |
| N5 | 🟡 | `extractFilePaths` misses `notebook_path` |

## Prior decisions (Round 1)

- C3 = Option A — wire scope/test-first at tool time (DECISION-002)

## Open decision — N3 test-first severity

**Decision:** How should tool-time `guardTestFirst` behave after wiring?

### Scored options

| Option | Summary | Value | Effort fit | Risk | Fit | **Total** |
|--------|---------|------:|-----------:|-----:|----:|----------:|
| A | Keep hard deny (current) | 2 | 5 | 2 | 2 | **11** |
| B | Downgrade to warn — allow edit, inject additionalContext | 4 | 4 | 4 | 5 | **17** |
| C | Hard deny only for newly created source files | 4 | 3 | 3 | 4 | **14** |

**Recommendation:** Option **B** (17/20) — grep-based test-first cannot prove failure; hard deny breaks normal bug-fix/refactor flows.

**User choice:** **A — Keep hard deny** (2026-06-10). Accept as known limitation; document in hooks docs.

## User choice (Round 1)

**C3:** Option A — wire into provider hooks/router (2026-06-10)
