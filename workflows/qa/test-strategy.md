# Workflow: test-strategy

Structured **testing strategy** for a feature, release, or codebase area: pyramid shape, risk-based coverage, environments, and measurable exit criteria.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `test-strategy.md`.

**Invoke:** `/test-strategy`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `test-strategy` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `scope` | Yes | Feature, epic, repo area, or release candidate |
| `risk_hotspots` | No | Known fragile modules, incidents, or compliance areas |
| `domain_stack` | No | Test tooling context (Jest, Vitest, Playwright, …) |

## Outputs

| Variable | Description |
|----------|-------------|
| `test_plan` | What to add at unit / integration / e2e; priorities |
| `not_testing` | Explicit exclusions with rationale |
| `metrics` | Coverage or quality signals (not coverage theater) |

## Decision paths

- **Greenfield:** Favor fast unit tests for pure logic; contract tests at boundaries.
- **Legacy with few tests:** Characterization tests first (`testing-pro` + `w-refactor` alignment).
- **Flaky e2e:** Reduce scope; stabilize fixtures; prefer API-level tests over full browser where possible.
- **Regulated / safety-critical:** Bias toward integration + audit trails; document evidence.

## Error handling

- **Unknown behavior:** Strategy says "observe first" — exploratory notes before automation promises.
- **CI resource limits:** Split suites; mark expensive tests; parallelization notes.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.  
Final artifact SHOULD align with **[`templates/report/test-strategy.md`](../../templates/report/test-strategy.md)**.  
Use tables for **risk → test type → owner**.  
Residual risks: what could still ship untested.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single team feature | < 2 h |
| **Standard** | Milestone / quarterly hardening | 1 day |
| **Deep** | Org test transformation | > 3 days |

## Escalation

- **Human:** Budget for QA headcount, device labs, license tools.
- **Autonomous:** Pyramid recommendations, folder conventions, CI job sketch.

## Steps

### Step 1 — `inventory-and-risk`

- **Type:** skill
- **Skill:** `planning-pro` + `bug-discovery-pro`
- **Input:** `scope`, `risk_hotspots`
- **Output:** Failure modes; user-visible paths; data boundaries.

### Step 2 — `shape-pyramid`

- **Type:** skill
- **Skill:** `testing-pro`
- **Input:** Risk inventory
- **Output:** Unit vs integration vs e2e allocation; fixtures/mocks policy; snapshot discipline.

### Step 3 — `tooling-and-ci`

- **Type:** skill
- **Skill:** `ci-cd-pro` + `testing-pro`
- **Input:** Stack constraints
- **Output:** Where tests run; required checks; flake handling; artifacts (reports, traces).

### Step 4 — `synthesize-and-handoff`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Steps 1–3
- **Output:** `test_plan`, `not_testing`, `metrics`.

## Notes

- Pair with **`prompts/generation/test-generation.md`** for generating tests from requirements.
