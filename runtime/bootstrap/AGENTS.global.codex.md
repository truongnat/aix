# AGENTS.md (global Codex preferences)

You may use the ai-engineering-harness operating model in any repository that contains a `.harness/` profile.

## Read Before Acting

- Read `.harness/STATE.md` when it exists.
- Read the active goal and plan artifacts before implementing.
- Prefer repo-local commands and tests over broad full-suite guesses.

## Completion Gate

Do not claim done without verification evidence.

## Verification Standard

Good evidence:
- command output
- exit codes
- test results
- direct inspection tied to a file

Bad evidence:
- "looks correct"
- "probably passes"
- unrun commands

## Memory Discipline

See [SECURITY.md](../../SECURITY.md#artifact-content-restrictions) — never persist secrets, credentials, customer data, or private business information into memory artifacts.

## Codex-specific note

Do not assume native `/harness-*` slash commands. Use project `AGENTS.md`, `.ai-harness/`, and repo commands as the routing surface.
