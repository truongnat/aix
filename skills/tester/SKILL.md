---
name: tester
description: >-
  Step workflow: sk-review requirements → test plan → test cases → self-check.
  Full STLC coverage with REQ_REVIEW, TEST_PLAN, TESTCASES, DEFECT_LOG,
  TEST_SUMMARY. Challenge requirement clarity and testability before writing
  cases. Metrics-driven quality assessment with go/no-go recommendation.
  (Hard contract in this SKILL.md — MUST follow.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "qa,test-lifecycle"
  roles: "critic"
  compatible: "claude,cursor,codex,gemini"

---

# Tester

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Act as a sk-tester/QA in the agent workflow via a **forced step sequence** that covers the full Software Testing Life Cycle (STLC):

1. Seed all templates into session
2. Review requirements for clarity, testability, completeness — **stop and ask** on blockers
3. Create test plan with strategy, estimation, environment, risks
4. Develop test cases with full traceability (including API test cases)
5. Self-check (sk-planning gate) — verify sk-planning artifacts before sk-execution
6. Setup and verify test environment with smoke test
7. Execute test cases, log defects, identify patterns
8. Compile test summary with metrics, go/no-go recommendation

Prefer acceptance criteria and verify steps from `TASKS.md` when present; use `PLAN.md` for overall DoD / `test_strategy`. Prefer writing or running automated tests **after** the feature code those tests cover already exists (or against an agreed existing surface). `sk-ba-test` is pre-implementation test design only; `sk-tester` owns QA/STLC execution and go/no-go; `sk-executing-pro` owns per-task implementation verification.

## Workflow architecture (mandatory)

- Read **one** step fully; finish it before the next.
- **NEVER** skip step-01 (template seed).
- **NEVER** write test cases before requirement sk-review is sk-done.
- **NEVER** write test plan before requirement blockers are resolved.
- **NEVER** execute tests before step-05 sk-planning gate passes.
- **NEVER** claim complete until step-08 passes.
- Keep the **progress checklist** in every artifact updated each step.

**Two phases:**
- **Planning phase** (steps 01–05): sk-review → plan → cases → self-check
- **Execution phase** (steps 06–08): environment → execute → summary

| Path | Role |
|------|------|
| [templates/REQ_REVIEW.template.md](./templates/REQ_REVIEW.template.md) | Requirement sk-review seed |
| [templates/TEST_PLAN.template.md](./templates/TEST_PLAN.template.md) | Test plan seed |
| [templates/TESTCASES.template.md](./templates/TESTCASES.template.md) | Test cases seed |
| [templates/DEFECT_LOG.template.md](./templates/DEFECT_LOG.template.md) | Defect log seed |
| [templates/TEST_SUMMARY.template.md](./templates/TEST_SUMMARY.template.md) | Test summary seed |
| the detailed instructions in this skill | Copy all templates into session |
| the detailed instructions in this skill | Review BA artifacts for clarity/testability |
| the detailed instructions in this skill | Strategy, estimation, environment, risks |
| the detailed instructions in this skill | Test cases with traceability + API tests |
| the detailed instructions in this skill | Planning gate — verify before sk-execution |
| the detailed instructions in this skill | Verify test environment + smoke test |
| the detailed instructions in this skill | Execute tests, log defects, patterns |
| the detailed instructions in this skill | Metrics, coverage, go/no-go |

### Execution entry

**Start here:** Read and follow the detailed instructions in this skill immediately after this Contract.

Use `references/acceptance-to-test-summary.md` to preserve `FR/NFR/BR/US → AC → TC → execution → defect → test summary` traceability and honest go/no-go evidence.

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts or steps.

| Field | Requirement |
|-------|-------------|
| preferred_role | `critic` (routing hint for multi-CLI; fallback main). |
| Inputs | Requirements, TASKS.md (preferred for AC/verify per task), PLAN.md (strategy/DoD), acceptance criteria, user stories, business rules, BA artifacts (BUSINESS_ANALYSIS.md, PRD, USER_FLOW, etc.), current/expected behavior, test environment, existing tests, test data, screenshots or test-run recordings. |
| Safety | Do NOT claim pass if not run or no evidence. Do NOT decide expected behavior when requirements are unclear. Do NOT use real/sensitive data as test data without permission. Do NOT proceed past requirement sk-review with blocking questions unanswered. |

### Required artifacts

#### `REQ_REVIEW.md`
- Required: yes; write only under the active session.
- **step_ledger** (required, table): Steps 01–05 status; no later step sk-done while earlier is todo.
- **executive_summary** (required, array): Maximum five bullets — requirement count, clarity score, top risks, blockers, next action.
- **developer_overview** (required, object): Status, requirements reviewed count, blocking issues, next action.
- **requirement_inventory** (required, array): ID, source artifact, title, type (FR/NFR/AC/US).
- **clarity_assessment** (required, array): Req ID, clarity (Clear/Ambiguous/Missing), testability (Yes/No/Partial), evidence, notes.
- **completeness_check** (required, array): Area, expected coverage, actual coverage, gap, risk.
- **feasibility_assessment** (optional, array): Requirement, technical risk, dependency, verdict (Pass/Fail/Unknown).
- **traceability_matrix** (required, array): Req ID → User story → AC → Test case ID, coverage status.
- **qa_items** (required, array): Question, target (BA/PM/Dev), blocking (Yes/No), answer.
- **risk_assessment** (optional, array): Risk, source, impact, mitigation.
- **handoff** (required, string): Next step and readiness.

#### `TEST_PLAN.md`
- Required: yes; write only under the active session.
- **step_ledger** (required, table): Steps 01–05 status.
- **executive_summary** (required, array): Maximum five bullets — scope, strategy, risk, effort, next action.
- **developer_overview** (required, object): Status, P0 coverage, critical gaps, next action.
- **test_scope** (required, object): In scope, out of scope, assumptions.
- **test_strategy** (required, object): Approach by level (unit/integration/E2E/manual), test types with rationale.
- **test_estimation** (required, object): Technique, effort breakdown by phase with numbers.
- **environment_requirements** (required, array): Category, requirement, status.
- **risk_assessment** (required, array): Risk, impact, likelihood, mitigation, priority.
- **schedule** (optional, array): Phase, start, end, entry criteria, exit criteria.
- **deliverables** (required, array): List of artifacts this cycle produces.
- **handoff** (required, string): Next step and readiness.

#### `TESTCASES.md`
- Required: yes; write only under the active session.
- **step_ledger** (required, table): Steps 01–05 status.
- **executive_summary** (required, array): Maximum five bullets with scope, highest-risk coverage, critical gaps, and next action.
- **developer_overview** (required, object): Test scope status, P0 coverage, critical gaps, next action.
- **charts** (optional, array): Mermaid coverage/priority chart when useful; otherwise N/A.
- **session_timestamp** (required, string): ISO 8601 with timezone.
- **test_scope** (required, string): In scope, out of scope, assumptions.
- **applicable_groups** (required, string): Which test groups apply (A/B/C/D) and which are skipped with reasons.
- **test_cases** (required, array): ID, priority, type, title, preconditions, steps, test data, expected result, requirement mapping, verification method, status.
- **api_test_cases** (optional, array): ID, priority, type, endpoint, method, headers, payload, expected response, assertions.
- **regression_checklist** (optional, array): Area, scenario, expected result, priority.
- **test_data** (optional, array): Data, purpose, source/setup, notes.
- **testing_gaps** (optional, array): Gap, risk, suggested follow-up.

#### `TESTCASES.csv`
- Required: no
- CSV file for Excel/Google Sheets import when user requests.

#### `DEFECT_LOG.md`
- Required: yes (seeded in step-01; populated during/after sk-execution).
- **step_ledger** (required, table): Steps 01–05 status.
- **executive_summary** (required, array): Maximum five bullets — total defects, critical count, open count, trend, recommendation.
- **developer_overview** (required, object): Status, total, open, closed, deferred.
- **defect_summary_by_severity** (required, array): Severity, total, open, in progress, fixed, verified, deferred, duplicate.
- **defect_summary_by_area** (required, array): Area/module, total, critical, high, medium, low.
- **defect_list** (required, array): BUG-ID, title, severity, priority, area, status, description, steps to reproduce, expected vs actual, environment, evidence, assigned to.
- **patterns_and_root_causes** (optional, array): Pattern, frequency, affected areas, recommendation.
- **handoff** (required, string): Next step and blockers.

#### `TEST_SUMMARY.md`
- Required: yes (seeded in step-01; populated after sk-execution).
- **step_ledger** (required, table): Steps 01–05 status.
- **executive_summary** (required, array): Maximum five bullets — cycle result, coverage, quality verdict, top risk, recommendation.
- **developer_overview** (required, object): Status, quality verdict (Go/No-Go/Conditional), coverage %, pass rate, open critical bugs, recommendation.
- **test_metrics** (required, array): Metric, planned, actual, variance — rows: total cases, passed, failed, blocked, not run, pass rate.
- **coverage_analysis** (required, array): Area/feature, total cases, passed, failed, blocked, coverage %.
- **defect_analysis** (required, object): Summary from DEFECT_LOG — by severity, by area, density, trend.
- **requirement_coverage** (required, array): Req ID, test cases covering it, pass/fail status, gaps.
- **quality_assessment** (required, array): Criteria, threshold, actual, verdict (Pass/Fail).
- **go_no_go_recommendation** (required, object): Recommendation (Go/No-Go/Conditional), rationale, conditions, residual risks.
- **lessons_learned** (optional, array): Area, observation, recommendation.
- **handoff** (required, string): Next step and blockers.

### Lifecycle boundary

- `sk-ba-test`: lightweight checklist/cases before implementation; never claims runtime pass.
- `sk-tester`: canonical QA/STLC owner, including environment setup, test execution, defect patterns, metrics, and go/no-go.
- `sk-executing-pro`: verifies implementation task acceptance criteria; it does not replace the QA cycle.

Use the trace chain `REQ/US/AC → TESTCASE → EXECUTION evidence → TEST_SUMMARY`.

### Reference

## Forbidden outputs (reject / rewrite)

| Failure | Fix |
|---------|-----|
| No template seed / no progress checklist | Restart step-01 |
| progress checklist skipped / later step `sk-done` while earlier `todo`/`blocked` | Fix ledger; return to earliest incomplete step |
| Test cases before requirement sk-review sk-done | Return to step-02 |
| Test plan before requirement blockers resolved | Return to step-02; ask blockers |
| Requirements restated without clarity/testability challenge | Fill Clarity assessment; ask blockers |
| Test cases without requirement mapping | Add REQ-ID mapping to every test case |
| Vague test cases ("should work", "per spec") | Rewrite with explicit steps and expected result |
| Real PII in test data | Replace with fake data using example.com domain |
| Go recommendation with open P0 bugs | Change to No-Go or Conditional |

## Quality Standards

### Cross-artifact

- [ ] progress checklist sequential and complete (or blocked with questions) in all 5 artifacts.
- [ ] Traceability is complete: REQ_REVIEW → TESTCASES IDs are mapped.
- [ ] No leftover `_(TODO)_` in filled sections.
- [ ] First-pass readable: concrete names (paths/APIs/IDs); no abstract filler.
- [ ] Confirm-first: on Blocking need, STOP immediately; classify Ask method; ask; finished artifact is not a quiz.

### REQ_REVIEW.md

- [ ] Every requirement from upstream artifacts has a row in Requirement inventory.
- [ ] Every requirement has Clarity (Clear/Ambiguous/Missing) and Testability (Yes/No/Partial) assessed.
- [ ] Completeness check covers all feature areas with 7-axis analysis (happy path, error handling, boundary, permissions, data validation, concurrency, state transitions).
- [ ] Blocking questions have target (BA/PM/Dev) and blocking flag.
- [ ] Traceability matrix maps Req → US → AC (TC column filled after step-04).

### TEST_PLAN.md

- [ ] Test scope references REQ_REVIEW findings.
- [ ] Strategy covers at least functional + regression testing.
- [ ] Estimation has explicit numbers per phase (not "TBD" or "it depends").
- [ ] Risk assessment has ≥1 real risk or explicit "no material risks" with evidence.
- [ ] Environment requirements list all dependencies.

### TESTCASES.md

- [ ] Each test case has: ID, type (Positive/Negative/Boundary/Security/Concurrency), priority (P0/P1/P2), steps, and expected result.
- [ ] Happy path, negative cases, and edge cases are covered.
- [ ] Every P0 AC has ≥1 test case with Positive + Negative + Boundary.
- [ ] Every test case maps to a requirement ID from REQ_REVIEW.
- [ ] API test cases (if in scope) have: endpoint, method, headers, payload, expected status, assertions.
- [ ] Test data does NOT contain real personal information.
- [ ] Manual steps are precise enough to repeat.
- [ ] Testing gaps are documented (not silently ignored).

### DEFECT_LOG.md

- [ ] Each defect has: BUG-ID, title, severity, priority, steps to reproduce, expected vs actual, evidence.
- [ ] Severity classification follows standard: Critical (system crash/data loss), High (major feature broken), Medium (feature degraded), Low (cosmetic/minor).
- [ ] Patterns section identifies recurring root causes.

### TEST_SUMMARY.md

- [ ] Test metrics have planned vs actual with variance.
- [ ] Quality assessment has explicit thresholds (e.g. "Pass rate ≥ 95%").
- [ ] Go/No-Go recommendation references metrics (not gut feeling).
- [ ] Residual risks are listed when recommendation is Conditional or Go.

## WRONG vs CORRECT

### Requirement sk-review

```markdown
// WRONG — accepts requirements at face value
All requirements are clear. Proceed to test sk-planning.

// CORRECT — challenges clarity and testability
REQ-003: "The system should load quickly"
  Clarity: Ambiguous — "quickly" has no measurable threshold.
  Testability: No — cannot assert "quickly" without a number.
  Q-003 → BA: What is the maximum acceptable page load time? (Blocking=Yes)

REQ-007: "Admin can export reports as PDF"
  Clarity: Clear — specific actor, action, output format.
  Testability: Yes — can verify PDF generation and download.
```

### Test plan estimation

```markdown
// WRONG — vague estimation
Testing will take about 2 weeks.

// CORRECT — explicit estimation with technique
Technique: AC-based counting.
- 24 acceptance criteria across 6 features
- Average 4 test cases per AC = 96 test cases
- Estimated sk-execution: 96 cases × 15 min/case = 24 hours
- Phase breakdown:
  - Requirement sk-review: 4h
  - Test design: 16h (96 cases × 10 min)
  - Environment setup: 4h
  - Execution: 24h
  - Defect reporting: 8h
  - Regression: 8h
  - Summary: 4h
  - Total: 68h (~9 person-days)
```

### Test case quality

```markdown
// WRONG — vague test case
Test login — should work.

// CORRECT — explicit test case
TC-LOGIN-001 | Positive | P0
Precondition: User has valid credentials.
Steps:
1. Open login page.
2. Enter valid email "admin@example.com".
3. Enter valid password.
4. Click Login.
Expected: Redirect to dashboard. User name visible in header.
Requirement: REQ-003, AC-003
```

```markdown
// WRONG — API test without assertions
Test the user creation endpoint.

// CORRECT — explicit API test
API-001 | POST /api/users | P0 | Positive
Headers: Content-Type: application/json, Authorization: Bearer {token}
Payload: {"name": "Test User", "email": "test@example.com"}
Assert:
  1. Status code = 201
  2. response.id is not null
  3. response.email = "test@example.com"
  4. response.createdAt matches ISO 8601 format
Requirement: REQ-010, AC-010
```

### Go/No-Go recommendation

```markdown
// WRONG — gut feeling
Everything looks good. Recommend release.

// CORRECT — metrics-driven recommendation
Quality assessment:
  - Pass rate: 97.2% (threshold: ≥95%) → Pass
  - P0 bugs open: 0 (threshold: 0) → Pass
  - P1 bugs open: 3 (threshold: ≤2) → Fail
  - Requirement coverage: 100% (threshold: 100%) → Pass

Recommendation: Conditional
Rationale: Pass rate and P0 criteria met. 3 open P1 bugs must be resolved.
Conditions: Fix BUG-012, BUG-015, BUG-018 before release.
Residual risks: BUG-019 (Low) accepted — cosmetic issue on settings page.
```

## Edge Cases

| Situation | Handling |
|---|---|
| Acceptance criteria are not testable | Document in REQ_REVIEW Clarity assessment. Create Q&A item with Blocking=Yes. Do not write test cases until clarified. |
| User wants CSV export | Create `TESTCASES.csv` with the same columns after the Markdown table. |
| Existing tests already cover some cases | Reference existing tests in TESTCASES.md. Do NOT duplicate them. Note in Testing gaps which areas rely on existing tests. |
| No test environment available | Document in TEST_PLAN environment section. Mark affected test cases as Blocked. Suggest manual verification only. |
| Business rules are missing | Mark in REQ_REVIEW Completeness check. Recommend sk-business-analysis skill first. |
| Requirements change mid-cycle | Update REQ_REVIEW with delta. Reassess affected test cases. Update traceability matrix. |
| No upstream BA artifacts | Document in REQ_REVIEW as "No formal requirements found." Work from TASKS.md AC or user stories. Flag as risk. |
| API endpoints undocumented | Document in REQ_REVIEW Completeness check. Suggest API discovery or documentation first. |
| Defect is duplicate | Mark as Duplicate in DEFECT_LOG with reference to original BUG-ID. |

## Limitations

- Does NOT replace sk-execution — artifacts are sk-planning and documentation, not test runs.
- Does NOT guarantee full coverage if requirements are incomplete.
- Does NOT replace code sk-review or deep security audit.
- Does NOT auto-implement fixes for defects found.
- Does NOT replace stakeholder decisions on go/no-go — recommendation only.
- DEFECT_LOG and TEST_SUMMARY are populated during/after sk-execution, not during sk-planning steps.

## Output

Produce a reusable tester artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-tester`** owns test design and execution evidence: test levels, fixtures, assertions, environments, regression selection, exploratory checks, and reproducible test results.

It does **not** own product requirements, implementation, architecture, or the final release decision. Route missing behavior definitions to `sk-story-spec` or `sk-specify`, implementation defects to the domain owner, and pass/fail sufficiency to the canonical `sk-verify-pro`.

**Primary artifact:** a test matrix or execution report linking each check to an expected result and evidence location. **Handoff:** return failures to the implementation owner and submit complete evidence to `sk-verify-pro`.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions (sk-verification is a compatibility facade only).
