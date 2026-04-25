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