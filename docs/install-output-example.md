# Install Output Example

## Purpose

Show compact illustrative installer output so first-time users know what to expect and what to do next.

Canonical scope: illustrative installer output snippets, not the procedural adoption walkthrough.

For the actual first-time adoption sequence after install, use [install-to-profile-walkthrough.md](install-to-profile-walkthrough.md).

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
2. Run: node bin/aih.js install --target /path/to/my-project
3. Continue with install-to-profile setup in docs/install-to-profile-walkthrough.md.
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
3. Continue with docs/install-to-profile-walkthrough.md for profile, goal, and validation steps.
4. Use docs/adoption-guide.md for broader adoption context.
```

## Common Confusion

- dry-run lists many files and can feel visually dense
- install copies the harness surface, but does not create `.harness/` profile artifacts for you
- a passing install does not mean the target repository is ready until profile artifacts exist

## Safety Notes

- use `--dry-run` before real install when adopting into an unfamiliar repository
- do not store secrets or private business data in `.harness/`
- keep validation structural and markdown-first
