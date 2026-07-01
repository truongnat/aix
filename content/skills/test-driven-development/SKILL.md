---
name: test-driven-development
description: 'Skill: test-driven-development'
x-kind: process
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---
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

The TDD process consists of two key testing phases around execution:

### Phase A: Test to Detect & Define (Test để phát hiện và định nghĩa - BEFORE Execution)
1. Write the test or check first to define the expected behavior (for features) or reproduce the issue (for bug fixes).
2. Run the test and observe it fail (confirming a meaningful "RED" state). For bug fixes, this test MUST prove the existence of the bug. For features, it MUST prove the behavior does not yet exist.

### Phase B: Test to Ensure Completion (Test để đảm bảo hoàn thành - AFTER Execution)
3. Implement the minimal code changes necessary to satisfy the test.
4. Re-run the test to confirm it now passes (confirming a valid "GREEN" state).
5. Refactor the code as needed, running the test after each change to verify it remains green (regression protection).

## Operating Principles

- **Dual-testing discipline**: Always separate tests into "define/reproduce" (before execution) and "verify/ensure completion" (after execution).
- **Evidence comes before implementation**: Never write behavioral code without a failing test first.
- **Failures must be intentional**: A test that passes before you write the code is not a valid definition of change.
- **Smallest passing change**: Implement only what is required to pass the test; avoid scope creep.
- **Regression protection**: Ensure the test persists to prevent future code changes from breaking the behavior.

## Reasoning Procedure

1. Restate the behavior that must be proven.
2. Define the smallest failing check that captures it.
3. Derive the implementation target from that check.
4. Stop and report blocked if the behavior cannot be tested yet.

## Action Loop

- Thought: identify the next proof point for the behavior.
- Action: write or run the smallest relevant test.
- Observation: record the actual test result.
- Repeat until the behavior is covered.

## Examples

### Example 1

Input: A prompt example must not be boilerplate.

Output:
- Failing check: the skill example text still uses a generic example instead of a filled schema.
- Minimal implementation: replace the placeholder example with a filled schema.
- Passing verification: the new example names concrete fields and outputs.

### Example 2

Input: The behavior cannot be reproduced or tested yet.

Output:
- Blocked: no reproducible test surface yet.
- Needed next step: define the smallest observable check before implementation.
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

- [ ] Test to detect and define (Phase A) was written and observed to fail before implementation
- [ ] The minimal changes were implemented
- [ ] Test to ensure completion (Phase B) passes after implementation
- [ ] Regression protection exists for the changed behavior
