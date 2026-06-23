---
id: debugging
name: Debugging Domain Skill
status: draft
scope: domain
version: 1
can_block: false
can_write: false
inputs:
  - failing repro
  - symptom description
  - relevant logs or tests
outputs:
  - selected domain guidance
  - generated harness profile entries
tools:
  - harness-map
  - harness-discuss
  - harness-plan
  - harness-verify
---

# Debugging Domain Skill

## Purpose

Route bugs, flaky behavior, and regressions toward root-cause checks.

## When To Use

- bug investigations, flaky tests, or regressions
- performance or correctness issues
- when diagnosis dominates implementation

## When Not To Use

- feature work with no bug signal
- docs-only changes
- pure routing work

## Inputs

- failing repro
- symptom description
- relevant logs or tests

## Workflow

- reproduce the issue or isolate the failing check
- state one falsifiable hypothesis at a time
- confirm the root cause before applying the fix
- add regression coverage for the original failure

## Operating Principles

- Prefer the debugging pack as the routing aid for this repository.
- Keep the generated surface small and reviewable.
- Do not generate a domain skill when the stack signal is weak or absent.

## Reasoning Procedure

- symptom-only fixes are not durable
- the smallest reproducible failure is the best guide
- adjacent-flow checks matter after the fix

## Action Loop

- inspect the failing path and surrounding code
- narrow the hypothesis set
- run the targeted repro or test
- record the confirmed cause and the regression guard

## Examples

- flaky integration test -> debugging domain skill with reproduction steps
- performance regression -> debugging domain skill with targeted benchmark

## Output Contract

- store selected debugging signals in config and the skills profile
- generate `.harness/skills/debugging/` when selected

## Checklist Before Done

- do not generate if there is no failing signal or debugging need
- do not ship a root-cause claim without evidence

## Common Failure Modes

- symptom-only fix: bug reappears in a nearby path
  - Counter: prove the root cause and check an adjacent flow
- unreproduced bug: fix lands without proof of failure
  - Counter: capture a failing test or reliable repro first when possible
