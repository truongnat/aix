<!-- sk-tester skill — TEST_SUMMARY template
     Readability rules:
       - English headings, column names, enums, code, paths (shared form).
       - Prose follows settings.yaml language (en|vi). One language per artifact.
       - Concrete names (paths / IDs / APIs). No filler. No leftover _(TODO)_.
       - Step ledger is sequential: no later step sk-done while earlier is todo.
-->

# Test Summary

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

- _(TODO: bullet 1 — test cycle result: pass/fail overview)_
- _(TODO: bullet 2 — coverage achieved vs planned)_
- _(TODO: bullet 3 — quality verdict: Go / No-Go / Conditional)_
- _(TODO: bullet 4 — top residual risk)_
- _(TODO: bullet 5 — recommendation and next action)_

## Developer overview

| Field              | Value     |
|--------------------|-----------|
| Status             | _(TODO)_  |
| Quality verdict    | _(TODO: Go / No-Go / Conditional)_ |
| Coverage %         | _(TODO)_  |
| Pass rate          | _(TODO)_  |
| Open critical bugs | _(TODO)_  |
| Recommendation     | _(TODO)_  |

## Test metrics

| Metric            | Planned  | Actual   | Variance |
|-------------------|----------|----------|----------|
| Total test cases  | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Passed            | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Failed            | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Blocked           | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Not run           | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| **Pass rate**     | _(TODO)_ | _(TODO)_ | _(TODO)_ |

## Coverage analysis

| Area / feature     | Total cases | Passed | Failed | Blocked | Coverage % |
|--------------------|-------------|--------|--------|---------|------------|
| _(TODO: feature)_  | _(TODO)_    | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |

## Defect analysis

### By severity

| Severity   | Total | Open | Closed | Deferred |
|------------|-------|------|--------|----------|
| Critical   | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| High       | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Medium     | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Low        | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |

### By area

| Area / module    | Defect count | Defect density _(bugs/100 LOC or per feature)_ |
|------------------|--------------|-------------------------------------------------|
| _(TODO)_         | _(TODO)_     | _(TODO)_                                        |

### Trend

_(TODO: describe defect discovery trend — early spike, steady, late surge?)_

## Requirement coverage

| Req ID  | Test cases covering it       | Pass / Fail           | Gap / notes              |
|---------|------------------------------|-----------------------|--------------------------|
| REQ-001 | _(TODO: TC-001, TC-002)_     | _(TODO: 2/2 pass)_    | _(TODO: or "fully covered")_ |

## Quality assessment

| Criteria                        | Threshold     | Actual        | Verdict _(Pass/Fail)_ |
|---------------------------------|---------------|---------------|-----------------------|
| Pass rate                       | _(TODO: ≥95%)_| _(TODO)_      | _(TODO)_              |
| P0 / Critical bugs open         | _(TODO: 0)_   | _(TODO)_      | _(TODO)_              |
| P1 / High bugs open             | _(TODO: ≤2)_  | _(TODO)_      | _(TODO)_              |
| Requirement coverage            | _(TODO: 100%)_| _(TODO)_      | _(TODO)_              |
| Blocked test cases              | _(TODO: 0)_   | _(TODO)_      | _(TODO)_              |
| Regression pass rate            | _(TODO: 100%)_| _(TODO)_      | _(TODO)_              |

## Go / No-Go recommendation

| Field            | Value                                                |
|------------------|------------------------------------------------------|
| Recommendation   | _(TODO: Go / No-Go / Conditional)_                   |
| Rationale        | _(TODO: why — reference metrics above)_              |
| Conditions       | _(TODO: what must happen before Go, if Conditional)_ |
| Residual risks   | _(TODO: known issues accepted for release)_          |

## Lessons learned

| Area                | Observation                          | Recommendation                    |
|---------------------|--------------------------------------|-----------------------------------|
| _(TODO: e.g. environment)_ | _(TODO: what happened)_        | _(TODO: what to improve next cycle)_ |

## Handoff

| Field           | Value                                                |
|-----------------|------------------------------------------------------|
| Ready           | _(TODO: Yes / No)_                                   |
| Next step       | _(TODO: release / next test cycle / stakeholder sk-review)_ |
| Blockers        | _(TODO: open issues preventing release or none)_     |
