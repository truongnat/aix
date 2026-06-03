# test-driven-development

## Purpose

Introduce or change behavior by defining evidence first, then implementing the smallest change that satisfies it.

## When To Use

- for feature work that changes behavior
- for bug fixes
- for refactors that need regression protection

## When Not To Use

- for pure documentation changes
- for structure-only repository scaffolding with no behavioral code path
- when verification is inherently manual and cannot be automated yet

## Inputs

- the behavior change to prove
- the relevant test or check surface
- the current plan step being implemented

## Workflow

1. Define the failing check or expected behavior first.
2. Run it and confirm the failure is meaningful.
3. Implement the smallest change that should pass.
4. Re-run the check and confirm it passes.
5. Refactor only while keeping evidence green.

## Operating Principles

- Evidence comes before implementation.
- Failures should be intentional, not accidental.
- The smallest passing change is usually best.
- Regression protection matters more than elegance.

## Output Contract

This skill must produce:

- a failing-check note or equivalent red-state evidence
- a minimal implementation summary
- a passing verification note

## Common Failure Modes

- writing implementation before observing the failing behavior
- expanding scope while “already in the file”
- counting manual confidence as a substitute for regression protection

## Checklist Before Done

- [ ] Behavior was defined before implementation
- [ ] The initial failure was observed when applicable
- [ ] The minimal change was made
- [ ] The relevant checks now pass
- [ ] Regression protection exists for the changed behavior
