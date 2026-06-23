# ai-engineering-harness (Gemini CLI)

## Capability source

Read `.ai-harness/AGENTS.md` first. Use `.ai-harness/commands/`, `.ai-harness/skills/`, `.ai-harness/workflows/`, `.ai-harness/patterns/`, and `.ai-harness/templates/` for pack capabilities.

If `.ai-harness/` is missing, reinstall with project capability cache.

## Project state

Read `.harness/` profile artifacts in this repository before planning or coding:

- `.harness/HARNESS.md` — scope and operating model
- `.harness/TEAM.md` — team pattern and handoffs
- `.harness/SKILLS.md` — selected skills
- `.harness/WORKFLOW.md` — command sequence
- `.harness/GATES.md` — quality gates
- `.harness/MEMORY.md` — durable lessons (no secrets)
- `.harness/goals/` — active goal artifacts

## Loop

start → discuss → plan → run → verify → ship → remember

Use `harness-map` only for manual context refresh outside the normal loop.

## Verification standard

Verification is complete only when `VERIFY.md` or the active verification artifact contains fresh command output, test results, exit codes, or an explicit manual check result.

Confidence is not evidence.

## Forbidden

- Implementing before the plan is approved
- Shipping when verification is missing, blocked, or unproven
- Writing secrets, tokens, customer data, or private business data into `.harness/`
- Continuing after a blocking question without an answer
- Claiming commands were run when they were only proposed

Do not skip verification. Do not invent facts missing from artifacts.
