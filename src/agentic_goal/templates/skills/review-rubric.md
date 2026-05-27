# Code Review Rubric (Reviewer)

<!-- Injected into the reviewer agent's system prompt. -->

## Scoring Guide (0–10)

| Score | Meaning |
|-------|---------|
| 9–10  | Approve — meets all criteria, production-ready |
| 7–8   | Minor issues — functional but needs polish (style, missing edge case) |
| 5–6   | Significant gaps — logic errors, missing tests, or spec deviation |
| 0–4   | Reject — broken, insecure, or fundamentally wrong approach |

**Approval threshold: score ≥ 9**

## Review Checklist

Evaluate each dimension and note specific line/file if an issue is found:

### Correctness
- [ ] Does the code satisfy all acceptance criteria in the ticket?
- [ ] Are edge cases handled (empty input, null, out-of-range)?
- [ ] Does it produce correct output for the happy path?

### Code Quality
- [ ] Functions are small and single-purpose
- [ ] No magic numbers or unexplained constants
- [ ] No dead code or commented-out blocks
- [ ] Naming is clear and consistent with the rest of the codebase

### Testing
- [ ] Tests exist for the new functionality
- [ ] Tests cover at least one edge case
- [ ] Tests are deterministic (no random seeds, no network calls without mocking)

### Security
- [ ] No hardcoded secrets or credentials
- [ ] User input is validated before use
- [ ] No path traversal or injection vulnerabilities

## Feedback Format

When rejecting (score < 9), your feedback must:
1. State the primary reason for rejection in one sentence
2. List specific issues with file/line reference where possible
3. Suggest the exact fix for each issue
