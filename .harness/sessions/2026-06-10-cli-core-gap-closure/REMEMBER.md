# Remember

## Durable Lessons

### PLAN-001 (Round 1)

1. **Session STATE lives at repo root.** Guards that read `current_plan` must use `<repoRoot>/.harness/STATE.md`, not `<sessionDir>/STATE.md`. Session dirs hold GOAL/PLAN/VERIFY, not the router STATE file.

2. **Hook session paths must be repo-relative to repoRoot.** When wiring guards from `codex-hook-router.js`, resolve the active session with `path.join(repoRoot, sessionField)` — not `process.cwd()` — or guards fail with "Session path not found".

3. **CLI value flags need the `_util.js` guard.** Any `args[++i]` without rejecting `value.startsWith("--")` can silently consume the next flag (e.g. `--scope --yes`).

4. **Enforcement narrative must match wiring.** Three guards existed but only `guard-phase` was wired; gap reviews should distinguish "implemented" vs "invoked at runtime".

### PLAN-002 (Round 2)

5. **`run-with-active-session.js` must parse `session:` field, not backticks.** STATE uses `session: sessions/<id>`; regex for `` `sessions/...` `` never matched, so Claude hooks silently skipped. Use `extractField(state, "session")` like other guards.

6. **File guards belong on edit tools only.** Running scope/test-first on every PreToolUse tool (including Read/Grep) causes false denials when `path` is out-of-scope but read-only. Gate with `isEditTool()` matching Write/Edit/MultiEdit/apply_patch/NotebookEdit.

7. **Test-first hard deny is a product choice, not a bug.** Option A keeps deny severity; document that routine edits to tested code may block until a failing assertion exists in the corresponding test file.

## Promoted To

- `HAZARDS.md` — HAZARD-004 (scope guard STATE path), HAZARD-005 (read-tool false denials)
- `INDEX.md` — guard-scope smoke, session wrapper test, router read/write recipes
- `DECISIONS.md` — DECISION-002 (C3 Option A), DECISION-003 (N3 Option A)

## Not Worth Global Memory

- T14 scan/domains test deferral (task-level only)
- N5 `notebook_path` without dedicated unit test (low impact)
