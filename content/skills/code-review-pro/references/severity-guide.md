# Severity Guide - Code Review

## Critical

Apply `critical` when the finding would justify stopping a deploy or merge immediately.

Use this when the issue could cause:
- data loss or corruption in production
- auth bypass, injection, exposed credentials, or similar security break
- breaking API or contract behavior for external callers
- crash or panic under normal usage
- regression of a previously fixed high-impact bug

Example:
- "Auth middleware no longer wraps POST /admin/users; privilege escalation risk."

Decision rule:
- If you would stop a production deploy for this, mark it `critical`.

## Important

Apply `important` when the change is likely wrong, unverified, or risky enough that it should be fixed before ship, but it is not an immediate production-severity blocker.

Use this when the finding:
- would fail CI after merge
- changes behavior without adequate tests
- causes visible user impact under realistic usage
- is wrong in an edge case likely to matter
- leaves TODO or placeholder logic in a production path

Example:
- "Expiry logic changed but no regression test proves the new boundary case."

Decision rule:
- If a careful senior code review should block ship until it is fixed, mark it `important`.

## Minor

Apply `minor` when the issue is real but does not materially affect correctness, safety, or ship readiness.

Use this when the finding:
- is naming or readability only
- is style-only with no semantic effect
- is a non-blocking maintainability improvement
- is worth tracking but not worth blocking ship

Example:
- "Variable `x` obscures intent; rename to `userCount` in a follow-up."

Decision rule:
- If the code still works correctly as written, mark it `minor`.

## No Finding

When review finds no issues, still record:
- what was checked
- what could have been a finding but was not
- residual risk

Example:
- "Checked auth boundary, test coverage, and error handling. No findings. Residual risk: low."

Silence is not a no-findings result. Write the explicit outcome in the review artifact.

## Recording Rule

Record findings in review artifacts, not only in freeform chat.
