# code-review

## Purpose

Inspect changes for bugs, regressions, risk, and missing verification before work is accepted or shipped.

## When To Use

- before shipping non-trivial work
- when reviewing a plan or implementation
- when independent risk checking is needed

## When Not To Use

- when no changes have been made
- when the task is only early-stage goal clarification
- when the work is still too incomplete for meaningful inspection

## Inputs

- goal and plan artifacts
- changed files or diffs
- existing verification evidence if present

## Workflow

1. Read the goal, plan, and changed artifacts.
2. Compare the change against expected scope and behavior.
3. Look for correctness, regression, maintainability, and safety risks.
4. Identify missing tests, missing evidence, and hidden assumptions.
5. Record findings in severity order.

## Operating Principles

- Findings matter more than summaries.
- Risk should be concrete and evidence-based.
- Review the change against requirements, not just style.
- Missing verification is a finding.

## Output Contract

This skill must produce:

- a findings list
- open questions when needed
- a residual risk statement

## Common Failure Modes

- turning review into a style-only pass
- restating the diff without identifying risk
- ignoring verification gaps because code “looks fine”

## Checklist Before Done

- [ ] Goal and scope were reviewed
- [ ] Changed artifacts were inspected
- [ ] Risks were identified or ruled out
- [ ] Missing verification was called out if present
- [ ] Findings are concrete enough to act on
