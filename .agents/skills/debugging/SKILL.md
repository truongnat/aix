---
name: "Debugging Domain Skill"
description: "Route bugs, flaky behavior, and regressions toward root-cause checks."
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

## Checklist Before Done

- do not generate if there is no failing signal or debugging need
- do not ship a root-cause claim without evidence
