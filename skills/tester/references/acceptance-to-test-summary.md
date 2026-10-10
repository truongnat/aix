# Acceptance-to-test-summary traceability

Use stable IDs to connect requirement decisions to QA evidence and the go/no-go recommendation.

| Trace stage | Required fields |
|---|---|
| Requirement | `FR/NFR/BR/US` ID, source, scope and risk |
| Acceptance | `AC-*` ID, precondition, action, observable result |
| Test case | `TC-*` ID, mapped AC, data/environment, steps and expected result |
| Execution | Run ID, build/version, environment, actual result, evidence link |
| Defect | `BUG-*` ID, severity, reproduction, linked TC/AC and disposition |
| Summary | Pass/fail/blocked counts, coverage gaps, residual risk, go/no-go owner |

`sk-ba-test` may design pre-implementation cases, `sk-executing-pro` verifies implementation cards, and `sk-tester` owns QA/STLC execution and release recommendation. Do not report “passed” when a required environment, case, or evidence link is missing; mark it blocked or partial.
