<!-- sk-tester skill — TEST_PLAN template
     Readability rules:
       - English headings, column names, enums, code, paths (shared form).
       - Prose follows settings.yaml language (en|vi). One language per artifact.
       - Concrete names (paths / IDs / APIs). No filler. No leftover _(TODO)_.
       - Step ledger is sequential: no later step sk-done while earlier is todo.
-->

# Test Plan

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

- _(TODO: bullet 1 — scope and approach summary)_
- _(TODO: bullet 2 — top risk or constraint)_
- _(TODO: bullet 3 — effort estimate)_
- _(TODO: bullet 4 — critical gaps or blockers)_
- _(TODO: bullet 5 — next action)_

## Developer overview

| Field            | Value     |
|------------------|-----------|
| Status           | _(TODO)_  |
| P0 coverage      | _(TODO)_  |
| Critical gaps    | _(TODO)_  |
| Next action      | _(TODO)_  |

## Test scope

### In scope

_(TODO: list features, modules, APIs, screens to be tested)_

### Out of scope

_(TODO: list features, modules, integrations explicitly excluded)_

### Assumptions

_(TODO: list assumptions about environment, data, availability)_

## Test strategy

### Approach by level

| Level       | Approach                                | Tool / Framework |
|-------------|-----------------------------------------|------------------|
| Unit        | _(TODO: developer-owned or QA-assisted)_| _(TODO)_         |
| Integration | _(TODO: API contracts, service calls)_  | _(TODO)_         |
| E2E         | _(TODO: critical user journeys)_        | _(TODO)_         |
| Manual      | _(TODO: exploratory, UX, edge cases)_   | _(TODO)_         |

### Test types

| Type            | Included | Rationale                        |
|-----------------|----------|----------------------------------|
| Functional      | _(TODO)_ | _(TODO)_                         |
| Regression      | _(TODO)_ | _(TODO)_                         |
| Smoke           | _(TODO)_ | _(TODO)_                         |
| API             | _(TODO)_ | _(TODO)_                         |
| Performance     | _(TODO)_ | _(TODO)_                         |
| Security        | _(TODO)_ | _(TODO)_                         |
| Compatibility   | _(TODO)_ | _(TODO)_                         |
| Accessibility   | _(TODO)_ | _(TODO)_                         |

## Test estimation

### Technique

_(TODO: test-point analysis / story-point mapping / AC-based counting)_

### Effort breakdown

| Phase               | Estimated effort | Notes                  |
|---------------------|------------------|------------------------|
| Requirement sk-review  | _(TODO)_         | _(TODO)_               |
| Test case design    | _(TODO)_         | _(TODO)_               |
| Environment setup   | _(TODO)_         | _(TODO)_               |
| Test sk-execution      | _(TODO)_         | _(TODO)_               |
| Defect reporting    | _(TODO)_         | _(TODO)_               |
| Regression          | _(TODO)_         | _(TODO)_               |
| Test summary        | _(TODO)_         | _(TODO)_               |
| **Total**           | **_(TODO)_**     |                        |

## Environment requirements

| Category       | Requirement                          | Status     |
|----------------|--------------------------------------|------------|
| Server / URL   | _(TODO)_                             | _(TODO)_   |
| Browsers       | _(TODO: Chrome, Firefox, Safari…)_   | _(TODO)_   |
| Mobile devices | _(TODO: iOS/Android, models)_        | _(TODO)_   |
| Test accounts  | _(TODO: roles, credentials source)_  | _(TODO)_   |
| Test data      | _(TODO: seed data, DB state)_        | _(TODO)_   |
| Third-party    | _(TODO: sandbox APIs, mock services)_ | _(TODO)_  |

## Risk assessment

| ID   | Risk                                | Impact | Likelihood | Mitigation                          | Priority |
|------|-------------------------------------|--------|------------|--------------------------------------|----------|
| R-001| _(TODO: risk description)_          | _(TODO)_| _(TODO)_  | _(TODO: mitigation strategy)_         | _(TODO)_ |

## Schedule & milestones

| Phase               | Start      | End        | Entry criteria                | Exit criteria                  |
|---------------------|------------|------------|-------------------------------|--------------------------------|
| Requirement sk-review  | _(TODO)_   | _(TODO)_   | BA artifacts available        | REQ_REVIEW.md complete         |
| Test sk-planning       | _(TODO)_   | _(TODO)_   | Requirements reviewed         | TEST_PLAN.md approved          |
| Test case design    | _(TODO)_   | _(TODO)_   | Test plan ready               | TESTCASES.md peer-reviewed     |
| Environment setup   | _(TODO)_   | _(TODO)_   | Test cases ready              | Smoke test passes              |
| Test sk-execution      | _(TODO)_   | _(TODO)_   | Environment ready             | All cases executed             |
| Defect triage       | _(TODO)_   | _(TODO)_   | Execution sk-done                | All P0/P1 resolved             |
| Test summary        | _(TODO)_   | _(TODO)_   | Triage sk-done                   | TEST_SUMMARY.md delivered      |

## Deliverables

_(TODO: list artifacts this test cycle produces)_

- [ ] `REQ_REVIEW.md` — Requirement sk-review and clarity assessment
- [ ] `TEST_PLAN.md` — This document
- [ ] `TESTCASES.md` — Test cases with traceability
- [ ] `DEFECT_LOG.md` — Defect register (during/after sk-execution)
- [ ] `TEST_SUMMARY.md` — Final test summary with go/no-go

## Handoff

_(TODO: recommended next step — sk-execution / test case peer sk-review / BA clarification)_

| Field           | Value                                    |
|-----------------|------------------------------------------|
| Ready           | _(TODO: Yes / No)_                       |
| Next skill      | _(TODO: sk-execution / sk-review)_             |
| Blockers        | _(TODO: list or "none")_                 |
