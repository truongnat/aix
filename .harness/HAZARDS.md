# Hazards

> Store durable, project-level hazards here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Put recurring failure modes, fragile integrations, and regression-prone areas here.
- Keep entries specific enough to change planning or verification behavior.
- Prefer confirmed hazards over vague worries.

## Entry Template

### HAZARD-000

- Date: YYYY-MM-DD
- Severity: low | medium | high
- Area: install | runtime | release | docs | evals
- Trigger: what condition causes the hazard
- Failure mode: what breaks
- Early warning signs: first signals to watch
- Mitigation: how to reduce or prevent the risk
- Verification focus: exact checks to run
- Related decisions: `DECISION-###`, if any
- Notes: links, incidents, or follow-up

## Example

### HAZARD-001

- Date: 2026-06-07
- Severity: medium
- Area: install
- Trigger: worktree repo or non-standard `.git` layout
- Failure mode: git hygiene writes to the wrong exclude path or silently skips it
- Early warning signs: install says success but `status` still shows missing exclude block
- Mitigation: resolve the effective git dir before reading or writing `.git/info/exclude`
- Verification focus: install into a normal repo and a worktree-backed repo
- Related decisions: `DECISION-001`
- Notes: keep one shared helper for git-dir resolution

### HAZARD-002

- Date: 2026-06-09
- Severity: medium
- Area: runtime
- Trigger: fresh install with `domains: []`; agent assumes hooks alone bootstrap the project
- Failure mode: no domain skills/rules generated; session state never established
- Early warning signs: `.harness/skills/` has only `.gitkeep`; hook events log `codex-hook` without `SESSION_START.md`
- Mitigation: SessionStart hook injects bootstrap intent via `hooks/core/domain-bootstrap.js`; Cursor rules require `harness-start` on first session
- Verification focus: `test/hooks/codex-hook-router.test.js` domain bootstrap cases; manual `harness-start` after install
- Related decisions: none
- Notes: Cursor still lacks native SessionStart hook — rules + explicit command required

### HAZARD-003

- Date: 2026-06-09
- Severity: medium
- Area: runtime
- Trigger: discuss-phase questions treated as `### Blocked` hard stops
- Failure mode: agent prints questions and ends turn; user must manually restart discuss
- Early warning signs: feature-choice prompts with `### Blocked` or "Stopped: workflow paused" during `harness-discuss`
- Mitigation: use `### Discussion` + structured question tools; continue after user answers per `rules/core/discussion.md`
- Verification focus: `harness-discuss` contract and `prompt-templates/discussion-question.md`
- Related decisions: none
- Notes: hard `### Blocked` remains correct for plan/run/verify/ship gates only

### HAZARD-004

- Date: 2026-06-10
- Severity: high
- Area: runtime
- Trigger: `guard-scope.js` (or similar) reads `STATE.md` inside session dir instead of repo-root `.harness/STATE.md`
- Failure mode: ENOENT → guard returns `status: failed` (exit 1) instead of scope check; enforcement silently broken
- Early warning signs: manual `guard-scope --json` returns `failed` not `blocked`; no scope violations ever recorded
- Mitigation: read `path.join(repoRoot, ".harness", "STATE.md")` with `existsSync`; mirror `guard-phase.js` pattern
- Verification focus: `test/backend/guard-scope.test.js`; smoke `node hooks/core/guard-scope.js --files … --session … --json`
- Related decisions: none
- Notes: from CLI_CORE_GAP_REVIEW C2

### HAZARD-005

- Date: 2026-06-10
- Severity: high
- Area: runtime
- Trigger: `evaluateFileEditHook` invoked for all PreToolUse tools including Read/Grep/Glob
- Failure mode: out-of-scope read paths denied; agents cannot inspect files outside plan scope even when read-only
- Early warning signs: router tests fail when `tool_name: Read` returns `deny`; users report "can't read file X" during harness-run
- Mitigation: gate file guards with `isEditTool()` — only Write/Edit/MultiEdit/apply_patch/NotebookEdit
- Verification focus: `test/hooks/codex-hook-router.test.js` Read allow + Write deny cases
- Related decisions: `DECISION-002`
- Notes: from CLI_CORE_GAP_REVIEW N2; introduced when C3 wired guards without tool filter

### HAZARD-006

- Date: 2026-06-10
- Severity: high
- Area: runtime
- Trigger: `run-with-active-session.js` parses session via backtick regex instead of `extractField(state, "session")`
- Failure mode: Claude Write/Edit hooks never invoke target guard; enforcement silently skipped (exit 0)
- Early warning signs: manual wrapper run with valid STATE returns 0 without invoking guard script
- Mitigation: use `extractField` from `_util.js`; normalize `sessions/<id>` to `.harness/sessions/<id>`
- Verification focus: `test/hooks/run-with-active-session.test.js`
- Related decisions: none
- Notes: from CLI_CORE_GAP_REVIEW N1; pre-existing bug exposed after C3 added guard-file-edits wiring
