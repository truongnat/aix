# ai-engineering-harness (global)

Apply these rules in any repository that contains `.harness/`.

## Read Before Acting

1. Read `.harness/STATE.md` when it exists to confirm the active phase and next command.
2. Read the active goal and plan artifacts before implementing or verifying.
3. Read `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, and `.harness/INDEX.md` when the task is non-trivial.

## Evidence Standard

Valid evidence:
- command output
- test results
- exit codes
- direct inspection findings tied to a file or artifact

Invalid evidence:
- "looks correct"
- "should work"
- "I'm confident"

## Discipline

- Do not implement before the goal and plan are clear.
- Do not claim done without fresh verification evidence.
- Stop when a blocking question or missing artifact prevents safe progress.

## Memory Safety

Never write credentials, tokens, customer data, or private business data into `.harness/` artifacts.
