---
name: debugging-investigation
description: 'Skill: debugging-investigation'
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

# debugging-investigation

## Purpose

Find the root cause of a failure before writing a fix so the work does not
collapse into a symptom-only patch.

## When To Use

- when a bug is unclear, intermittent, or hard to reproduce
- before writing a fix that is not already justified by evidence
- when a previous "obvious fix" did not hold
- when the symptom and cause are not yet separated

## When Not To Use

- when the bug is already reproduced, understood, and the fix is planned
- when the work is known implementation, not investigation
- when a manual-only issue cannot be reproduced yet and no further repro work is possible

## Inputs

- the reported failure or regression
- the smallest available reproduction surface
- existing logs, diffs, and relevant artifacts

## Workflow

1. Reproduce the failure reliably.
2. Reduce the problem to the smallest scope that still fails.
3. State one falsifiable root-cause hypothesis.
4. Test that hypothesis with a targeted check.
5. Apply the smallest fix that addresses the cause.
6. Record the root cause and any durable hazard in session artifacts.

## Operating Principles

- Reproduction comes before repair.
- A hypothesis should be specific enough to be wrong.
- The root cause is the target, not the visible symptom.
- Regression protection matters more than elegance.

## Reasoning Procedure

1. Restate the failure and the evidence available.
2. Identify the smallest reproducible surface and the leading hypothesis.
3. Derive the next targeted check from the hypothesis.
4. Stop and report blocked if the failure cannot be reproduced yet.

## Action Loop

- Thought: determine the next repro, inspection, or check.
- Action: run the smallest targeted command or read the relevant artifact.
- Observation: record the real result and update the hypothesis.
- Repeat until the root cause is confirmed or ruled out.

## Examples

### Example 1

Input: bin/validate.js passes, but the new content still looks generic.

Output:
- Reproduction evidence: validator passes and the same boilerplate example appears in multiple skills.
- Root cause statement: the content pass copied a shared example block instead of tailoring it per skill.
- Minimal fix summary: replace the boilerplate examples with skill-specific outputs.
- Hazard note: add a conformance check so the boilerplate pattern does not return.

### Example 2

Input: The failure cannot be reproduced with the current evidence.

Output:
- Blocked: missing reproducible failure surface.
- Needed next step: capture the smallest failing example before changing the code.
## Output Contract

This skill must produce:

- reproduction evidence or explicit repro steps
- a root cause statement
- a minimal fix summary
- a note on whether the failure mode belongs in `HAZARDS.md`

## Common Failure Modes

- treating a symptom as the cause
- writing a fix before a reproducible failure exists
- testing multiple competing hypotheses at once
- skipping related-behavior checks after the fix

## Verification Requirements

- the original failure now passes or is explained by a documented gap
- the root cause is stated explicitly in session artifacts
- related behavior was checked for collateral damage

## Checklist Before Done

- [ ] The failure was reproduced or the repro gap was documented
- [ ] One root-cause hypothesis was stated
- [ ] The targeted test or check confirmed the hypothesis or ruled it out
- [ ] The fix addresses the cause, not only the symptom
- [ ] A durable hazard note was considered
