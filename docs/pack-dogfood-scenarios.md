# Pack Dogfood Scenarios

## Purpose

Define candidate dogfood scenarios for `v0.8.0` so the capability pack is exercised in real target repositories with consistent evidence.

## How To Use

Pick at least two scenarios for `v0.8.0`. Complete one [pack-dogfood report](pack-dogfood-report-template.md) per scenario executed. Log friction in [pack-dogfood-friction-log.md](pack-dogfood-friction-log.md).

---

## Scenario A: Tiny Local Repo — Health Check

| Field | Value |
|---|---|
| Target repo type | tiny local app or script repo (few source files) |
| Runtime to use | Cursor or Claude Code (editor/repo-local) |
| Install mode | `node install.js --target <path>` from source pack |
| Goal id | `health-check` |
| Expected profile artifacts | `.harness/HARNESS.md`, `TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, `MEMORY.md` |
| Expected goal artifacts | `.harness/goals/health-check/GOAL.md`, `PLAN.md`, `TASKS.md`, `VERIFY.md`, `REMEMBER.md` (and others per contract) |

Reference: [examples/tiny-repo-adoption/](../examples/tiny-repo-adoption/) for shape inspiration—not a substitute for dogfooding an external repo.

Validation commands:

```bash
node validate.js --target <target-repo> --profile-only
node validate.js --target <target-repo> --goal health-check
```

Evidence to capture:

- install dry-run vs write output
- time to first passing profile validation
- agent read-first behavior (did it read `AGENTS.md` and adoption docs?)
- confusion between source pack path and target repo path

---

## Scenario B: Frontend Or Mobile Repo — Feature Goal

| Field | Value |
|---|---|
| Target repo type | frontend or mobile product repo (semi-real or real) |
| Runtime to use | Cursor (workspace) or Codex (scoped session)—second runtime optional on repeat |
| Install mode | install/copy; vendored directory acceptable if team prefers |
| Goal id | example: `google-login` or one small feature goal agreed for the repo |
| Expected profile artifacts | full `.harness/` profile set tuned to mobile/frontend scope |
| Expected goal artifacts | goal folder with acceptance criteria and verification plan |

Reference: [examples/dogfood-tiny-node-api/](../examples/dogfood-tiny-node-api/) for workflow artifact shape.

Validation commands:

```bash
node validate.js --target <target-repo> --profile-only
node validate.js --target <target-repo> --goal <goal-id>
```

Evidence to capture:

- whether installed docs were enough for setup and workflow entry
- skill pack / team pattern selection friction
- runtime guide accuracy (read-first list, validation flow)
- missing optional docs from installed surface

---

## Scenario C: Backend Or Tooling Repo — Maintenance Goal

| Field | Value |
|---|---|
| Target repo type | backend service, CLI, or internal tooling repo |
| Runtime to use | Gemini CLI or OpenCode (terminal-oriented) if available; otherwise Codex |
| Install mode | install/copy |
| Goal id | example: `validation-hardening` or `api-health-check` |
| Expected profile artifacts | profile emphasizing pipeline/reviewer or maintenance workflow |
| Expected goal artifacts | goal focused on structural validation, docs, or operational checklist—not production deploy |

Validation commands:

```bash
node validate.js --target <target-repo> --profile-only
node validate.js --target <target-repo> --goal <goal-id>
```

Evidence to capture:

- terminal cwd vs target repo clarity
- whether `validate.js` path from target repo is obvious
- friction installing only needed docs vs full surface
- agent tendency to edit source pack instead of target repo

---

## Cross-Scenario Requirements

For `v0.8.0` completion, satisfy:

- at least **2** scenarios executed in **distinct** target repositories
- at least **2** runtimes used across the dogfood set when practical
- every executed scenario has a filled report and any friction logged
- no dogfood-only changes that break source pack `node validate.js` / `npm test`

## Safety Reminder

Do not commit customer data, credentials, or private business details into this repository. Summarize friction; redact sensitive paths and names in public artifacts.
