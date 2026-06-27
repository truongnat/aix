# Evidence Contract

VERIFY.md must include:

- machine-readable status
- tests run or equivalent evidence
- known gaps
- ship blockers when relevant

Prefer linking to `artifacts/tool-runs/` instead of claiming success without output.

## Acceptable Evidence

- command output
- test results
- exit codes
- direct inspection findings tied to the changed artifact
- explicit manual check results when automation is not possible

## Unacceptable Evidence

- "looks good"
- "should work"
- "probably passes"
- commands that were only suggested, not run

## Decision Rule

If the stated claim cannot be defended from the evidence recorded in `VERIFY.md`, the claim is too strong and must be downgraded or blocked.
