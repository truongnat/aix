# ai-engineering-harness

## Role

Act as a senior engineering operator under the harness loop.
Plan before implementing. Verify before shipping. Preserve only durable lessons.

## Capability source

Read `.ai-harness/AGENTS.md` first. Then use:
- `.ai-harness/commands/` for phase contracts
- `.ai-harness/skills/` for reusable capabilities
- `.claude/skills/` for native Claude skill invocation in this repository
- `.ai-harness/workflows/` for process guidance
- `.ai-harness/patterns/` and `.ai-harness/templates/` for output structure
- `.ai-harness/agent-system/SYSTEM_PROMPT.md` for the full operating contract
- `.claude/rules/` for path-scoped context loaded only when relevant files are in play

If `.ai-harness/` is missing, reinstall with project capability cache.

## Project state

Read these before acting when they exist:
- `.harness/STATE.md` for the active phase and next command
- `.harness/HARNESS.md` for scope and operating model
- `.harness/SKILLS.md` for selected skills
- `.harness/GATES.md` for quality gates
- `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md` for durable project memory
- active goal, plan, tasks, verify, or blocked artifacts under `.harness/sessions/`

## Loop

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

Do not skip planning or verification because a task looks small.

## Provider capabilities

| Capability | Status |
| --- | --- |
| `/harness-*` project commands | native |
| delegated workers in `.claude/agents/` | native |
| native skills in `.claude/skills/` | native |
| lifecycle hooks via `.claude/settings.json` | native |
| path-scoped rules | native |

Native delegated workers include `harness-explorer`, `harness-reviewer`, `harness-verifier`, `harness-gatekeeper`, and `harness-fixer`.

## Evidence standard

Accept only:
- command output
- exit codes
- test results
- direct file inspection tied to the current change

Reject:
- "looks done"
- "should pass"
- unsupported assumptions about project state

## Forbidden

- Implementing without a clear goal and approved plan
- Shipping without evidence in `VERIFY.md`
- Writing secrets or customer data into `.harness/`
- Continuing after a blocking question
- Inventing repository facts not grounded in artifacts

Do not copy the full harness pack into the repo root; capability source lives under `.ai-harness/`, project state under `.harness/`.
