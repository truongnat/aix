<!-- sk-tester skill — TESTCASES template
     Readability rules:
       - English headings, column names, enums, code, paths (shared form).
       - Prose follows settings.yaml language (en|vi). One language per artifact.
       - Concrete names (paths / IDs / APIs). No filler. No leftover _(TODO)_.
       - Step ledger is sequential: no later step sk-done while earlier is todo.
-->

# Test Cases

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

- _(TODO: bullet 1 — scope of test coverage)_
- _(TODO: bullet 2 — highest-risk areas covered)_
- _(TODO: bullet 3 — critical gaps remaining)_
- _(TODO: bullet 4 — total test case count by priority)_
- _(TODO: bullet 5 — next action)_

## Developer overview

| Field            | Value     |
|------------------|-----------|
| Status           | _(TODO)_  |
| P0 coverage      | _(TODO)_  |
| Critical gaps    | _(TODO)_  |
| Next action      | _(TODO)_  |

## Session timestamp

_(TODO: ISO 8601 with timezone)_

## Test scope

_(TODO: in scope, out of scope, assumptions)_

## Applicable groups

_(TODO: which test groups apply (A/B/C/D) and which are skipped with reasons)_

## Test cases

### TC-001 — _(TODO: title)_

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| ID                 | TC-001                                             |
| Priority           | _(TODO: P0 / P1 / P2)_                             |
| Type               | _(TODO: Positive / Negative / Boundary / Security / Concurrency)_ |
| Requirement mapping| _(TODO: REQ-ID, AC-ID)_                            |

**Preconditions:** _(TODO)_

**Steps:**

1. _(TODO)_
2. _(TODO)_
3. _(TODO)_

**Test data:** _(TODO: specific values, not real PII)_

**Expected result:** _(TODO: measurable, specific)_

**Verification method:** _(TODO: manual / automated / API assertion)_

---

<!-- Copy the TC-XXX block above for each additional test case. -->

## API test cases

### API-001 — _(TODO: endpoint description)_

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| ID                 | API-001                                            |
| Priority           | _(TODO: P0 / P1 / P2)_                             |
| Type               | _(TODO: Positive / Negative / Boundary / Security)_ |
| Requirement mapping| _(TODO: REQ-ID, AC-ID)_                            |
| Endpoint           | _(TODO: HTTP method + path, e.g. POST /api/users)_ |
| Headers            | _(TODO: Content-Type, Authorization, etc.)_        |

**Request payload:**

```json
{
  "_comment": "TODO: request body"
}
```

**Expected response:**

| Field          | Value                                    |
|----------------|------------------------------------------|
| Status code    | _(TODO: e.g. 201)_                       |
| Response body  | _(TODO: key fields to assert)_           |
| Headers        | _(TODO: expected response headers)_      |

**Assertions:**

1. _(TODO: e.g. status code = 201)_
2. _(TODO: e.g. response.id is not null)_
3. _(TODO: e.g. response.email matches request)_

---

<!-- Copy the API-XXX block above for each additional API test case. -->

## Regression checklist

| Area             | Scenario                        | Expected result          | Priority |
|------------------|---------------------------------|--------------------------|----------|
| _(TODO)_         | _(TODO)_                        | _(TODO)_                 | _(TODO)_ |

## Test data

| Data              | Purpose                    | Source / setup              | Notes                    |
|-------------------|----------------------------|-----------------------------|--------------------------|
| _(TODO)_          | _(TODO)_                   | _(TODO)_                    | _(TODO: no real PII)_    |

## Testing gaps

| Gap                                | Risk                         | Suggested follow-up         |
|------------------------------------|------------------------------|-----------------------------|
| _(TODO: uncovered area/scenario)_  | _(TODO: impact if untested)_ | _(TODO: what to do next)_   |
