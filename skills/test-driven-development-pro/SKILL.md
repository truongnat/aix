---
name: test-driven-development-pro
description: |
  Production-grade Test-Driven Development: RED-GREEN-REFACTOR cycle with test-first discipline, test design principles, refactoring safety, test quality standards, and integration with CI/CD — plus system model (requirement → failing test → passing implementation → refactoring), failure modes (test-first violations, brittle tests, test duplication, coverage theater), decision trade-offs (speed vs quality, unit vs integration, mock vs real), and quality guardrails (verifiable tests, no test duplication, meaningful failure messages).

  Use this skill when the user asks to implement features using TDD, write tests before code, refactor safely, improve test quality, or establish TDD practices.

  Use **with** **`testing-pro`** for test strategy and pyramid, **`bug-discovery-pro`** for defect discovery, **`ci-cd-pro`** for test automation in pipelines, and domain **`*-pro`** skills for testing patterns specific to the stack.

  Triggers: "TDD", "test-driven development", "test first", "RED-GREEN-REFACTOR", "write test before code", "refactor safely", "test quality", "test design".

metadata:
  short-description: TDD — RED-GREEN-REFACTOR, test-first discipline, refactoring safety
  content-language: en
  domain: testing
  level: professional
---

# Test-Driven Development (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [Kent Beck's TDD](https://www.amazon.com/Test-Driven-Development-Addison-Wesley-Signature/dp/0321146530) and [Growing Object-Oriented Software](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503637) for methodology; this skill encodes **RED-GREEN-REFACTOR discipline**, **test design principles**, **refactoring safety**, and **test quality standards** — not generic "write more tests" advice.

## Boundary

**`test-driven-development-pro`** owns **RED-GREEN-REFACTOR cycle execution**, **test-first discipline**, **refactoring safety**, and **test design principles**. **`testing-pro`** owns **test strategy, pyramid design, and CI integration**. **`bug-discovery-pro`** owns **defect discovery patterns**. Domain **`*-pro`** skills own **testing patterns specific to their stack** (e.g., **`react-pro`** for component testing).

## Related skills (this repo)

| Skill | When to combine with `test-driven-development-pro` |
|-------|-----------------------------------------------------|
| **`testing-pro`** | Test strategy, pyramid design, CI integration |
| **`bug-discovery-pro`** | Defect discovery and root cause analysis |
| **`ci-cd-pro`** | Test automation in pipelines |
| **Domain `*-pro` skills** | Stack-specific testing patterns |
| **`refactoring-pro`** | Code restructuring techniques (if exists) |

## When to use

- Implementing features using test-first discipline.
- Refactoring existing code with test safety net.
- Establishing or improving TDD practices in a team.
- Writing tests that drive good design.
- Improving test quality and reducing brittleness.
- Trigger keywords: `TDD`, `test-driven development`, `test first`, `RED-GREEN-REFACTOR`, `write test before code`, `refactor safely`, `test quality`

## When not to use

- **Pure test strategy** without implementation — **`testing-pro`** first.
- **Exploratory testing** or manual QA — not TDD scope.
- **Legacy code without tests** — characterization tests first, then TDD for new code.
- **Performance testing** — different discipline.

## Required inputs

- **Language/framework** and testing tools in use.
- **Feature requirement** or refactoring goal.
- **Existing test suite** state (coverage, quality).

## Expected output

Follow **Suggested response format** strictly — RED-GREEN-REFACTOR cycle with residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** language/framework, testing tools, feature requirement, and existing test state. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

- Start from a **single small behavior** that can be expressed as a failing test.
- Keep the RED-GREEN-REFACTOR loop tight; avoid designing a large solution before the first failing case.
- Prefer **clear test intent and meaningful failure output** over broad coverage numbers.
- Refactor only after the test is green and behavior is protected.
- Use the **minimum production change** needed to satisfy the current test before generalizing.

## Suggested response format

Use this structure for TDD work:

1. **Target behavior** — requirement slice being driven by the next test.
2. **RED** — the first failing test and what it proves.
3. **GREEN** — the minimal implementation to pass that test.
4. **REFACTOR** — what can be safely cleaned up now and why.
5. **Next test** — the next smallest behavior to drive.
6. **Risks or blockers** — brittleness, missing harness, or legacy-code constraints.

## Resources in this skill

- `references/red-green-refactor-cycle.md` — canonical TDD loop and execution order.
- `references/test-design-principles.md` — test quality, naming, and design heuristics.
- `references/failure-modes.md` — common TDD breakdowns and how to avoid them.

## Quick example

User asks: "Implement rate-limit parsing with TDD."

Response shape:
- Start with one failing test for the simplest valid input.
- Add only the minimal parser logic to make it pass.
- Refactor duplication after green.
- Identify the next test for invalid input or boundary handling.

## Checklist before calling the skill done

- The current behavior slice is explicit and small.
- A failing test exists before implementation changes.
- Production code added is minimal for the current green step.
- Refactoring is justified by passing tests, not by speculation.
- The next test or remaining gap is named.
