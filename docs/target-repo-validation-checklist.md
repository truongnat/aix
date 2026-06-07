# Target Repository Validation Checklist

Use this checklist to review a host repository after it has adopted the harness and produced `.harness/` profile artifacts.

Frozen validation behavior: [frozen-validation-contract.md](frozen-validation-contract.md).

## Required Files

- [ ] `AGENTS.md` exists at the repository root.
- [ ] `.harness/` exists.
- [ ] `.harness/HARNESS.md` exists.
- [ ] `.harness/TEAM.md` exists.
- [ ] `.harness/SKILLS.md` exists.
- [ ] `.harness/WORKFLOW.md` exists.
- [ ] `.harness/GATES.md` exists.
- [ ] `.harness/MEMORY.md` exists.

## CLI Validation Commands

- [ ] run `node bin/validate.js --target ../my-project` when the adopted repository should be checked at the profile level
- [ ] run `node bin/validate.js --target ../my-project --profile-only` when you want the explicit profile-only form
- [ ] run `node bin/validate.js --target ../my-project --goal 2026-06-04-google-login` when a specific active session artifact set should be checked
- [ ] use the profile check after creating or revising `.harness/HARNESS.md`, `TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, or `MEMORY.md`
- [ ] use the goal check after creating or revising `.harness/STATE.md` or `.harness/sessions/<session-id>/GOAL.md`, `PLAN-###.md`, `TASKS.md`, `VERIFY.md`, or `REMEMBER.md`

## Harness Profile Consistency

- [ ] the six profile artifacts agree on risk level, workflow, and operating model.
- [ ] the profile is repository-specific rather than generic filler.
- [ ] assumptions and unknowns are recorded where needed.
- [ ] the profile stops before implementation correctness claims.

## Team Pattern

- [ ] the selected team pattern is explicit.
- [ ] the pattern still fits the repository size and risk.
- [ ] handoff and escalation rules are clear enough to use.
- [ ] the profile does not introduce unnecessary team complexity.

## Skill Selection

- [ ] the selected core skills are the smallest sufficient set.
- [ ] selected skill packs fit the actual repository work shape.
- [ ] excluded skills or packs are called out when omission matters.
- [ ] the profile does not imply a large imported skill catalog.

## Workflow

- [ ] the workflow is explicit and matches how the team expects work to move.
- [ ] the command sequence prevents skipping planning or verification.
- [ ] the workflow is practical for the repository's delivery model.
- [ ] the workflow does not drift into runtime orchestration claims.

## Gates

- [ ] the gates define evidence expectations clearly.
- [ ] stop conditions are explicit.
- [ ] verification expectations are strong enough for the repository risk.
- [ ] the gates do not imply that a passing structural validator proves correctness.

## Memory Safety

- [ ] `MEMORY.md` defines durable memory boundaries clearly.
- [ ] no profile artifact stores credentials, tokens, `.env` values, customer data, or private business data.
- [ ] recall-before-planning and remember-after-shipping behavior are explicit.
- [ ] memory guidance is useful without becoming a secret store.

## Active Session Artifacts

- [ ] `.harness/STATE.md` points at the active session under `.harness/sessions/<session-id>/`.
- [ ] each active session has `SESSION.md`, `GOAL.md`, a numbered `PLAN-###.md`, `TASKS.md`, `VERIFY.md`, and `REMEMBER.md`.
- [ ] session artifacts reflect the selected profile workflow and gates.
- [ ] missing or stale session artifacts are treated as structural gaps, not hidden assumptions.

## Approval Decision

- [ ] approve as-is
- [ ] approve with small edits
- [ ] request revision before use
- [ ] reject because the adopted harness profile is incomplete, inconsistent, or unsafe
