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
