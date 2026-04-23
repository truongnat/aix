---
name: testing-pro
description: |
  Production-grade software testing and automation: test pyramid and CI feedback loop, failure modes (flaky tests, layer mistakes, env drift, coverage gaming), decision trade-offs (integration vs mocks, e2e breadth vs CI time, snapshots vs roles), quality guardrails (no invented metrics; evidence from pipeline).

  Use this skill when the user writes or reviews tests, sets up automation (CI/CD), uses Jest/Vitest/Mocha, React Testing Library, Playwright, Cypress, pytest, JUnit, TestNG, xUnit, Detox, XCTest, Espresso, k6/Gatling, Pact/contract tests, Testcontainers, or asks about coverage, mocks, stubs, TDD, BDD, test data, parallel runs, selectors, snapshots, visual regression, API testing, load/performance tests, or debugging flaky tests.

  Use **with** the relevant framework skill when tests are product-specific: **`react-pro`** / **`nextjs-pro`** (RTL, SSR/hydration test setup), **`nestjs-pro`** (TestingModule, e2e HTTP), **`flutter-pro`** (widget_test, integration_test), **`react-native-pro`** (Detox/Jest RN), **`postgresql-pro`** (DB fixtures, migration tests), **`ci-cd-pro`** (pipeline YAML). This skill (`testing-pro`) owns **strategy, layers, CI signal, and flakiness**; framework skills own **APIs and project conventions** for that stack.

  Triggers: "test", "testing", "unit test", "integration test", "e2e", "end-to-end", "automation", "CI", "CD", "GitHub Actions", "Jest", "Vitest", "Playwright", "Cypress", "pytest", "RTL", "React Testing Library", "mock", "stub", "spy", "fixture", "coverage", "flaky", "quarantine", "assertion", "TDD", "BDD", "Gherkin", "snapshot", "visual regression", "contract test", "Pact", "Load test", "k6", "Testcontainers", "MSW", "test harness", "arrange act assert", "given when then", "test timeout", "UnhandledPromiseRejection".

metadata:
  short-description: Testing — pyramid, CI feedback, failure modes, layers, flaky policy
  content-language: en
  domain: quality-engineering
  level: professional
---

# Testing (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official docs for each runner (e.g. [Jest](https://jestjs.io/), [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [pytest](https://docs.pytest.org/)) for API truth; this skill encodes **test strategy**, **CI feedback design**, **failure modes**, and **automation hygiene** — not framework-tutorial duplication. Confirm **language/runner**, **CI environment**, and **which bundled framework skill** applies when the codebase uses this repo’s `*-pro` skills.

## Boundary

**`testing-pro`** owns **what to test at which layer**, **determinism**, **flake policy**, **CI stages and artifacts**, and **cross-cutting** RTL/query priority. **`react-pro`** / **`nextjs-pro`** / **`nestjs-pro`** / … own **runner config, APIs, and stack-specific** harness details. **`ci-cd-pro`** owns **pipeline YAML** as the primary topic; pair here for **test job design and signals**.

## Related skills (this repo)

| Skill | When to combine with `testing-pro` |
|-------|-------------------------------------|
| **`react-pro`** | RTL/Vitest/Jest setup, component tests, hooks |
| **`nextjs-pro`** | App Router, RSC/`"use client"` test boundaries, server vs client |
| **`nestjs-pro`** | `TestingModule`, Supertest e2e, provider mocks |
| **`flutter-pro`** | `widget_test`, `integration_test`, goldens |
| **`react-native-pro`** | Detox/Maestro, RN Jest config |
| **`postgresql-pro`** | Integration tests against real SQL, RLS, migrations |
| **`security-pro`** | Abuse cases and regression security tests |
| **`ci-cd-pro`** | Workflow wiring, caching, matrix, secrets — test intent stays here |

Do **not** duplicate framework-specific testing advice that belongs in those skills; **link** them and add cross-cutting test design here.

## When to use

- Designing or refactoring a test suite (layers, naming, folder layout).
- **Automation**: CI workflows, parallel jobs, reports, artifacts, retries policy.
- Choosing tools (runner vs e2e vs browser vs API vs load).
- **Debugging** flaky tests, timeouts, async races, or environment drift.
- Reviewing **coverage** and what it does *not* prove.

## When not to use

- **Primary topic is CI/CD platform YAML** without test strategy — start with **`ci-cd-pro`**, pair this skill for test layout.
- **Pure application bug** with no testing angle — use the relevant **`stack-pro`** or **`gitnexus-debugging`** style workflow.
- **Legal/compliance attestation** beyond engineering test evidence.

## Required inputs

- **Stack** (language, runner, browser runner if any).
- **CI target** (PR vs main, sharding, services available).

## Expected output

Follow **Suggested response format (STRICT)** — context through residual risks.

## Workflow

1. Confirm stack, CI, and **framework skill** from the Related skills table when applicable.
2. Apply summaries; open `references/` for depth; defer framework API details to **`react-pro`** / **`nextjs-pro`** / **`nestjs-pro`** / … when applicable.
3. Respond with **Suggested response format (STRICT)**; include **failure modes** when production or CI stability is in scope.

### Operating principles

1. **Test behavior, not implementation** — Prefer public API / user-visible outcomes; avoid brittle internals unless unit-testing pure logic.
2. **Right layer** — Fast unit tests for logic; integration for DB/API/contracts; e2e for critical journeys — [references/test-pyramid-and-strategy.md](references/test-pyramid-and-strategy.md), [references/testing-pyramid-ci-and-feedback-system-model.md](references/testing-pyramid-ci-and-feedback-system-model.md).
3. **Determinism** — Control time (`fake timers`), network (mocks/MSW), and data (fixtures); isolate side effects — [references/edge-cases.md](references/edge-cases.md).
4. **CI is the source of truth** — If it only passes locally, fix env parity (timeouts, seeds, ports) — [references/automation-and-ci.md](references/automation-and-ci.md).
5. **Flakiness is debt** — Quarantine + fix root cause; avoid unlimited retries as policy — [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md).
6. **Automation scope** — Automate what runs repeatedly on every change; manual/exploratory for what is expensive to script.

### Pyramid, CI feedback, and signals (summary)

Layers, CI as feedback loop, signals beyond pass/fail — **`testing-pyramid-ci-and-feedback-system-model.md`**.

Details: [references/testing-pyramid-ci-and-feedback-system-model.md](references/testing-pyramid-ci-and-feedback-system-model.md)

### Failure modes — detection and mitigation (summary)

Flakes, layer mistakes, CI/env drift, brittle assertions — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Mocks vs integration, e2e breadth vs CI time, snapshots vs roles, contract vs e2e — **`decision-framework-and-trade-offs.md`**, **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Evidence discipline, coverage honesty, security-sensitive tests — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Test pyramid and strategy (summary)

Risk-based layering and naming — **`test-pyramid-and-strategy.md`**.

Details: [references/test-pyramid-and-strategy.md](references/test-pyramid-and-strategy.md)

### Automation and CI (summary)

Pipeline stages, parallelism, artifacts, secrets — **`automation-and-ci.md`**.

Details: [references/automation-and-ci.md](references/automation-and-ci.md)

### Tips and tricks (summary)

Frontend, backend, contracts, load — align with stack skills.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Async, time, selectors, parallel collisions — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

E2E-only, implementation-coupled tests, sleeps, retry-as-policy — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Runner majors and compatibility notes — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Stack, runner, CI target (PR/main), parallelism, services (DB, wiremock, etc.).
2. **Problem / goal** — Risk to cover, regression, contract, or CI pain (speed, flakes).
3. **System design** — Pyramid placement and CI feedback signals — **`testing-pyramid-ci-and-feedback-system-model.md`**.
4. **Decision reasoning** — Layer choice, mock vs integration, contract vs e2e — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Minimal test or CI stage sketch; **explicit handoff** to **`react-pro`** / **`nextjs-pro`** / **`nestjs-pro`** / … for framework-specific APIs — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — CI time vs confidence, maintenance vs snapshot convenience.
7. **Failure modes** — Flakes, env drift, coverage gaming — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untested journeys, known flake backlog, security cases needing **`security-pro`**.

## Resources in this skill

| Topic | File |
|-------|------|
| **Pyramid + CI feedback model** | [references/testing-pyramid-ci-and-feedback-system-model.md](references/testing-pyramid-ci-and-feedback-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Pyramid & strategy | [references/test-pyramid-and-strategy.md](references/test-pyramid-and-strategy.md) |
| Automation & CI | [references/automation-and-ci.md](references/automation-and-ci.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases & flakiness | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Tooling versions | [references/versions.md](references/versions.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

### 1 — Simple (common)

**Input:** E2E suite is slow and flaky; team runs everything on every PR.  
**Expected output:** Full **Suggested response format (STRICT)** — smoke vs full split, sharding, stable selectors, deterministic data, integration/contract for regressions; hand off RSC boundaries to **`nextjs-pro`**.

### 2 — Tricky (edge case)

**Input:** Tests pass alone but fail when the full file runs — order-dependent.  
**Expected output:** Shared mutable state, `beforeEach` reset, DB rollback; forbid inter-test coupling — **`failure-modes-detection-mitigation.md`**, **`edge-cases.md`**.

### 3 — Cross-skill

**Input:** Regression tests for IDOR fix in API.  
**Expected output:** **`testing-pro`** for two-user fixture and negative assertions; **`nestjs-pro`** for `TestingModule` + HTTP; **`security-pro`** for abuse framing.

## Checklist before calling the skill done

- [ ] Test level matches risk (not all e2e) — **`decision-tree.md`**.
- [ ] **Automation**: CI job order, caching, and failure artifacts — **`automation-and-ci.md`**.
- [ ] Deterministic data/time/network; no hidden sleeps as “fix” — **`edge-cases.md`**.
- [ ] Flaky tests tracked; root cause or quarantine with issue link — **`failure-modes-detection-mitigation.md`**.
- [ ] **RTL query** priority respected (`role`/label before `testId`) — **`decision-tree.md`**.
- [ ] Security-sensitive paths have **negative** tests where applicable — **`quality-validation-and-guardrails.md`**.
- [ ] Coverage interpreted as signal, not a single number — **`quality-validation-and-guardrails.md`**.
- [ ] **Framework-specific** guidance delegated per **`integration-map.md`** — no duplicate scope.
