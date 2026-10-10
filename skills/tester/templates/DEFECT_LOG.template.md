<!-- sk-tester skill — DEFECT_LOG template
     Readability rules:
       - English headings, column names, enums, code, paths (shared form).
       - Prose follows settings.yaml language (en|vi). One language per artifact.
       - Concrete names (paths / IDs / APIs). No filler. No leftover _(TODO)_.
       - Step ledger is sequential: no later step sk-done while earlier is todo.
-->

# Defect Log

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

- _(TODO: bullet 1 — total defects found this cycle)_
- _(TODO: bullet 2 — critical/high count and current status)_
- _(TODO: bullet 3 — open vs closed ratio)_
- _(TODO: bullet 4 — top affected area or pattern)_
- _(TODO: bullet 5 — recommendation or blocker for release)_

## Developer overview

| Field       | Value     |
|-------------|-----------|
| Status      | _(TODO)_  |
| Total       | _(TODO)_  |
| Open        | _(TODO)_  |
| Closed      | _(TODO)_  |
| Deferred    | _(TODO)_  |

## Defect summary by severity

| Severity   | Total | Open | In Progress | Fixed | Verified | Deferred | Duplicate |
|------------|-------|------|-------------|-------|----------|----------|-----------|
| Critical   | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| High       | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Medium     | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| Low        | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |
| **Total**  | **_(TODO)_** | | | | | | |

## Defect summary by area

| Area / module    | Total | Critical | High | Medium | Low |
|------------------|-------|----------|------|--------|-----|
| _(TODO: module)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ | _(TODO)_ |

## Defect list

### BUG-001 — _(TODO: title)_

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| Severity           | _(TODO: Critical / High / Medium / Low)_           |
| Priority           | _(TODO: P0 / P1 / P2)_                             |
| Area / module      | _(TODO)_                                           |
| Status             | _(TODO: Open / In Progress / Fixed / Verified / Deferred / Duplicate)_ |
| Found in           | _(TODO: test case ID or exploration)_              |
| Environment        | _(TODO: browser, OS, device, URL)_                 |
| Assigned to        | _(TODO)_                                           |

**Description:** _(TODO: one-sentence summary of the defect)_

**Steps to reproduce:**

1. _(TODO)_
2. _(TODO)_
3. _(TODO)_

**Expected result:** _(TODO)_

**Actual result:** _(TODO)_

**Evidence:** _(TODO: screenshot path, log excerpt, or video timestamp)_

---

<!-- Copy the BUG-XXX block above for each additional defect. -->

## Patterns & root causes

| Pattern                         | Frequency | Affected areas           | Recommendation                    |
|---------------------------------|-----------|--------------------------|-----------------------------------|
| _(TODO: e.g. missing validation)_ | _(TODO)_  | _(TODO: list modules)_   | _(TODO: e.g. add input validation layer)_ |

### Pattern analysis guidance

Look for recurring themes:

- Same root cause across multiple bugs (e.g. missing null check)
- Same module producing disproportionate defects
- Same type (boundary, permission, error handling) repeating
- Correlation with recent code changes

## Handoff

| Field           | Value                                          |
|-----------------|------------------------------------------------|
| Ready           | _(TODO: Yes / No)_                             |
| Next step       | _(TODO: test summary / development triage)_    |
| Blockers        | _(TODO: open critical bugs or none)_           |
