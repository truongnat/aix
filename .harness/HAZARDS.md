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
