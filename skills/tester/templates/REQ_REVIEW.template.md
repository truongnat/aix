<!-- sk-tester skill — REQ_REVIEW template
     Readability rules:
       - English headings, column names, enums, code, paths (shared form).
       - Prose follows settings.yaml language (en|vi). One language per artifact.
       - Concrete names (paths / IDs / APIs). No filler. No leftover _(TODO)_.
       - Step ledger is sequential: no later step sk-done while earlier is todo.
-->

# Requirement Review

## Step ledger

| Step | Name                          | Status | Evidence |
|------|-------------------------------|--------|----------|
| 01   | Init templates                | todo   |          |
| 02   | Review requirements           | todo   |          |
| 03   | Create test plan              | todo   |          |
| 04   | Develop test cases            | todo   |          |
| 05   | Self-check (sk-planning gate)    | todo   |          |
| 06   | Setup environment             | todo   |          |
| 07   | Execute tests & log defects   | todo   |          |
| 08   | Test summary & closure        | todo   |          |

## Executive summary

_(TODO)_

- _(TODO: bullet 1 — total requirements reviewed)_
- _(TODO: bullet 2 — clarity score: X% Clear / Y% Ambiguous / Z% Missing)_
- _(TODO: bullet 3 — top testability blockers)_
- _(TODO: bullet 4 — critical risks identified)_
- _(TODO: bullet 5 — next action or blocking questions)_

## Developer overview

| Field                | Value     |
|----------------------|-----------|
| Status               | _(TODO)_  |
| Requirements reviewed| _(TODO)_  |
| Blocking issues      | _(TODO)_  |
| Next action          | _(TODO)_  |

## Requirement inventory

| ID     | Source artifact              | Title                          | Type |
|--------|------------------------------|--------------------------------|------|
| REQ-001| _(TODO: BUSINESS_ANALYSIS)_  | _(TODO: requirement title)_    | _(TODO: FR/NFR/AC/US)_ |

## Clarity assessment

| ID     | Clarity _(Clear/Ambiguous/Missing)_ | Testability _(Yes/No/Partial)_ | Evidence / quote                  | Notes                      |
|--------|--------------------------------------|--------------------------------|-----------------------------------|----------------------------|
| REQ-001| _(TODO)_                             | _(TODO)_                       | _(TODO: section/line reference)_  | _(TODO)_                   |

### Clarity rules

- **Clear** — requirement is specific, measurable, no ambiguous words ("fast", "user-friendly", "properly").
- **Ambiguous** — requirement can be interpreted multiple ways; needs BA clarification.
- **Missing** — expected requirement not found (error handling, boundary, permission, edge case).
- **Testability Yes** — can write Given/When/Then directly from this requirement.
- **Testability Partial** — testable but needs assumptions or additional data.
- **Testability No** — too vague or incomplete to derive any test.

## Completeness check

| Area / feature         | Expected coverage                | Actual coverage                | Gap                              | Risk     |
|------------------------|----------------------------------|--------------------------------|----------------------------------|----------|
| _(TODO: e.g. Auth)_    | _(TODO: what should be covered)_ | _(TODO: what is documented)_   | _(TODO: what is missing)_         | _(TODO: High/Medium/Low)_ |

### Completeness axes

For each area, check whether the following are defined:

1. Happy path (primary success flow)
2. Error handling (invalid input, timeout, server error)
3. Boundary conditions (min/max, empty, overflow)
4. Permissions / roles (who can / cannot do what)
5. Data validation (format, length, type, uniqueness)
6. Concurrency (simultaneous actions, race conditions)
7. State transitions (status changes, lifecycle)

## Feasibility assessment

| Requirement                    | Technical risk                     | Dependency                       | Verdict _(Pass/Fail/Unknown)_ |
|--------------------------------|------------------------------------|----------------------------------|-------------------------------|
| _(TODO: requirement summary)_  | _(TODO: risk if any)_              | _(TODO: external dependency)_    | _(TODO)_                      |

## Traceability matrix

| Req ID  | User story | Acceptance criteria | Test case ID | Status     |
|---------|------------|---------------------|--------------|------------|
| REQ-001 | _(TODO)_   | _(TODO: AC-ID)_     | _(TODO)_     | _(TODO: Covered/Gap)_ |

## Q&A items

| ID    | Question                              | Target _(BA/PM/Dev)_ | Blocking _(Yes/No)_ | Answer     |
|-------|---------------------------------------|----------------------|---------------------|------------|
| Q-001 | _(TODO: clarification question)_      | _(TODO)_             | _(TODO)_            | _(TODO)_   |

### Mandatory stop gate

**STOP and wait for user answers when:**

- Any requirement has Clarity = `Ambiguous` or `Missing` AND Blocking = `Yes`
- Testability = `No` for a P0/P1 requirement
- Feasibility = `Fail` or `Unknown` for a critical requirement
- More than 30% of requirements are Ambiguous or Missing

Do not proceed to test sk-planning with unresolved blocking questions.

## Risk assessment

| ID    | Risk                                    | Source _(Req ID)_ | Impact _(H/M/L)_ | Mitigation                        |
|-------|-----------------------------------------|-------------------|-------------------|-----------------------------------|
| RR-001| _(TODO: risk from requirement gaps)_    | _(TODO)_          | _(TODO)_          | _(TODO: mitigation strategy)_     |

## Handoff

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Ready           | _(TODO: Yes / No)_                             |
| Next step       | _(TODO: test sk-planning / BA clarification)_     |
| Blockers        | _(TODO: list open blocking questions or none)_ |
