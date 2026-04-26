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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** stack, CI, and **framework skill** from the Related skills table when applicable. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm product surface, runner, and CI constraints before changing tests. Ask whether the goal is confidence, speed, or bug reproduction when unclear.
2. **Simplicity First** — Start with the cheapest test layer that can prove the behavior. Do not jump to E2E when a unit or integration test is enough.
3. **Surgical Changes** — Add or edit only the tests, fixtures, mocks, and automation wiring needed for the requested behavior. Do not rewrite unrelated suites.
4. **Goal-Driven Execution** — Done = the target behavior is reproducibly verified in the intended environment, and the test signal is stable enough for CI.
5. **Test user-observable behavior first** — Prefer assertions on outputs, DOM, API responses, or state transitions over private implementation details.
6. **Determinism over cleverness** — Control time, randomness, network, and seed data explicitly before adding retries or quarantine.
7. **Evidence beats coverage theater** — Coverage can guide exploration, but it never proves risk is closed.
8. **Flake is a defect** — A flaky test is broken product feedback; identify race, env drift, or bad selectors instead of normalizing retries.

## Default recommendations by scenario

- **Bug fix** — Reproduce the bug with the narrowest failing test first, then patch production code, then verify the test passes consistently.
- **New feature** — Add one primary path test at the lowest effective layer, then add higher-layer coverage only for integration boundaries or user-critical flows.
- **Refactor** — Preserve existing high-signal tests; add characterization tests only where behavior is unclear or risk is concentrated.
- **CI slowdown** — Split fast deterministic checks from slower integration/E2E jobs before reducing assertions.

## Decision trees

Summary: pick the lowest test layer that can prove the behavior, then escalate only when integration boundaries, browser/device behavior, or production wiring matter.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: brittle snapshots, implementation-detail assertions, retrying flaky tests without root cause, and mocking the exact layer you claim to validate.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Testing pyramid, CI, and feedback loop (summary)

How unit, integration, E2E, and pipeline stages fit together so failures are actionable instead of noisy.

Details: [references/testing-pyramid-ci-and-feedback-system-model.md](references/testing-pyramid-ci-and-feedback-system-model.md)

### Failure modes and mitigation (summary)

Common causes of flake, env drift, selector fragility, and fake confidence, plus how to detect them early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

When to mock, when to hit real dependencies, and how to trade CI time against confidence.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Automation and CI (summary)

How to shard, gate, and publish artifacts so test failures are debuggable in CI.

Details: [references/automation-and-ci.md](references/automation-and-ci.md)

### Versions (summary)

Runner and ecosystem version notes that change supported APIs or recommended setup.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Stack, runner, CI target, and which framework skill owns the product-specific harness.
2. **Testing goal** — Bug reproduction, regression prevention, confidence increase, or CI stabilization.
3. **Recommended layer** — Unit, integration, E2E, contract, load, or visual; explain why this is the minimum sufficient layer.
4. **Implementation** — Test cases, fixtures, mocks, and exact assertions; use **Code** for snippets.
5. **Verification** — Commands or CI jobs to run, plus what passing evidence should look like.
6. **Residual risks** — Remaining blind spots, flake vectors, or environment differences.

## Resources in this skill

| Topic | File |
|-------|------|
| Testing pyramid, CI, feedback model | [references/testing-pyramid-ci-and-feedback-system-model.md](references/testing-pyramid-ci-and-feedback-system-model.md) |
| Test pyramid and strategy | [references/test-pyramid-and-strategy.md](references/test-pyramid-and-strategy.md) |
| Automation and CI | [references/automation-and-ci.md](references/automation-and-ci.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "A checkout bug was fixed; I need regression coverage fast."
- Add the narrowest integration or component test that reproduces the failing path first.
- Keep fixtures minimal and assert the user-visible outcome, not internal method calls.
- **Verify:** Targeted test passes locally and in the same CI job that previously missed the bug.

**Input (tricky):** "Our Playwright suite flakes only on CI around midnight."
- Suspect timezone, clock, or seeded data drift before adding retries.
- Freeze time or seed data explicitly; capture screenshots, traces, and timezone config in CI artifacts.
- **Verify:** Re-run the same shard multiple times in CI without intermittent failure.

**Input (cross-skill):** "I need tests for a NestJS endpoint with Postgres RLS."
- Pair **`nestjs-pro`** for `TestingModule` and request wiring, **`postgresql-pro`** for app-role and tenant policy setup.
- Use integration tests against a real database role instead of mocking the authorization boundary away.
- **Verify:** Allowed tenant passes, forbidden tenant fails, and policy behavior matches production role semantics.

## Checklist before calling the skill done

- [ ] Stack, runner, and CI target confirmed before proposing tests (Think Before Coding)
- [ ] Started with the minimum effective test layer; no unnecessary E2E expansion (Simplicity First)
- [ ] Only touched tests, fixtures, and automation directly related to the requested behavior (Surgical Changes)
- [ ] Success criteria and verification command are explicit; target behavior is proven in the intended environment (Goal-Driven Execution)
- [ ] Assertions focus on observable behavior, not private implementation details
- [ ] Time, randomness, network, and test data are controlled where determinism matters
- [ ] Any retries, quarantine, or snapshot use is justified rather than used to hide flakiness
- [ ] Residual blind spots or environment gaps are stated explicitly
