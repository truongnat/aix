---
name: testcase-coverage-reviewer
description: "Review an existing test case set (the user's or a colleague's) to find missing cases, using the same criteria matrix as testcase-generator. Use when the user already has a test case suite and wants a coverage check before testing or before release — pinpointing exact gaps, not vague verdicts."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,test-review,coverage,test-design"
---

# Testcase Coverage Reviewer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If review files are created, store them under:

```text
artifacts/YYYY-MM-DD/testcase-coverage-reviewer/HHmmss-feature-slug/
```

Every artifact must record `Session timestamp`, the test case source, the coverage matrix, and proposed additions. All main chat output must also show `Session timestamp`.

## Goal
Take an existing set of test cases (pasted into chat or attached as a file), check it against the standard criteria matrix, and name EXACTLY which cases are missing — never rewrite the whole set, never conclude with a vague "looks fairly complete."

## Support scripts
If the test case set arrives as a file, run `read_excel.py --report` first for `.csv`/`.xlsx` to identify sheets, headers, and sample rows before reviewing coverage — don't blind-read the whole file.

## Process

### Step 1 — Read the existing set
Identify: which feature is under test, and which of the four standard groups each existing case covers.

### Step 2 — Map against the standard matrix (same as testcase-generator)

- **Group A — Input-based**: equivalence partitioning, boundary values, format/type validation.
- **Group B — Business logic**: decision tables (condition combinations), state transitions.
- **Group C — System-level**: permission/role, concurrency, data persistence, negative/error handling, cross-browser/device.
- **Group D — Priority sanity**: is each case's priority right? Any P0-worthy case mislabeled P2? API-specific checks when the set targets endpoints (required params, auth variants, error codes, contract shape).

For each group, state: does it apply to this feature? Which existing cases cover it? What's concretely missing? — and don't count non-applicable groups as gaps.

### Step 3 — Output the matrix

| Group | Applies? | Covered by | Missing | Proposed addition |
|---|---|---|---|---|
| A - Input | Yes | TC_001, TC_002 | No boundary min/max cases | New TC: value = 0 and value > max |
| B - Business logic | Yes/No | ... | ... | ... |
| C - System-level | Yes/No | (none) | Entire applicable group uncovered | Propose 3–5 permission + concurrency cases |
| D - Priority | Yes | ... | TC_005 marked P2 but is main-flow → should be P0 | Reprioritize |

### Step 4 — Summarize
- `Coverage = applicable checklist items covered / total applicable checklist items`.
- Don't invent a percentage when the applicable-item total is unknown.
- Name the weakest group and the top 3 additions to write first if time is short.

## Judgment rules
- A case that EXISTS but is poorly written (merged steps, no expected result) is not "missing" — flag it as "needs rewrite" in the Proposed column instead.
- No duplicates: never propose a case that's already covered, even under a different name.
- Distinguish "not covered because it doesn't apply" from "not covered, real gap" — the former needs a one-line reason, not a proposed case.

## Anti-patterns
- Reviewing only for missing positive cases and ignoring whole-system groups — Group C gaps are the ones that ship bugs.
- Proposing additions without naming WHY they're missing (which checklist item, which risk).
- A coverage verdict without the matrix — "70% coverage" means nothing without showing what's uncovered.
