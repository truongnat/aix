# Install Output Example

## Purpose

Show compact illustrative installer output so first-time users know what to expect and what to do next.

## Dry Run Example

```txt
WOULD COPY AGENTS.md
WOULD COPY commands/harness-start.md
WOULD COPY docs/adoption-guide.md
...
Install summary:
- target: /path/to/my-project
- mode: dry-run
- copied: 72
- skipped: 0
- failed: 0
Next steps:
1. Review the files marked WOULD COPY.
2. Run: node install.js --target /path/to/my-project
3. After install, create .harness/ profile artifacts.
```

## Real Install Example

```txt
COPY AGENTS.md
COPY commands/harness-start.md
COPY docs/adoption-guide.md
...
Install summary:
- target: /path/to/my-project
- mode: write
- copied: 72
- skipped: 0
- failed: 0
Next steps:
1. Open the target repository.
2. Read AGENTS.md.
3. Create .harness/HARNESS.md, TEAM.md, SKILLS.md, WORKFLOW.md, GATES.md, and MEMORY.md.
4. Use docs/adoption-guide.md and docs/target-repo-validation.md for setup guidance.
5. Validate: node validate.js --target /path/to/my-project --profile-only
```

## What To Do After Install

- open the target repository
- read `AGENTS.md`
- create the six required `.harness/` profile artifacts
- follow [docs/adoption-guide.md](adoption-guide.md)
- run target profile validation

## Common Confusion

- dry-run lists many files and can feel visually dense
- install copies the harness surface, but does not create `.harness/` profile artifacts for you
- a passing install does not mean the target repository is ready until profile artifacts exist

## Safety Notes

- use `--dry-run` before real install when adopting into an unfamiliar repository
- do not store secrets or private business data in `.harness/`
- keep validation structural and markdown-first
