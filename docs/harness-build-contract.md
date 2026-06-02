# Harness Build Contract

## Purpose

This document defines the minimum contract that `harness-build` outputs must satisfy.

## Required Profile Artifacts

A harness build should produce:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

## Required Goal Artifacts

For each concrete goal, a harness build should be able to support:

- `.harness/goals/<goal-id>/GOAL.md`
- `.harness/goals/<goal-id>/PLAN.md`
- `.harness/goals/<goal-id>/TASKS.md`
- `.harness/goals/<goal-id>/VERIFY.md`
- `.harness/goals/<goal-id>/REMEMBER.md`

Additional artifacts such as `TASK.md`, `EXECUTION.md`, `SHIP.md`, or `DISCUSSION.md` can be added when the work needs them.

## Artifact Relationships

- `HARNESS.md` defines the overall operating context.
- `TEAM.md` defines collaboration shape and escalation rules.
- `SKILLS.md` defines the smallest sufficient capability set.
- `WORKFLOW.md` defines the work type and execution rules.
- `GATES.md` defines the evidence standard and stop conditions.
- `MEMORY.md` defines durable recall and storage boundaries.

These files should agree with each other. A harness profile is inconsistent if one artifact implies a workflow, team shape, or risk posture that the others do not support.

## Validation Expectations

Lightweight validation should confirm:

- required files exist
- required headings exist
- templates are non-empty
- demo artifacts follow the same basic structure as the templates

## What Validation Does Not Prove

Validation does not prove:

- the selected pattern is the best choice
- the selected skills are sufficient for every future task
- the verification plan is deep enough for a real production system
- the example artifacts match a live repository exactly

Structural validation is necessary, not sufficient.

## Safety Notes

- do not store secrets, tokens, customer data, or private business data
- do not treat a passing validator as proof that the harness profile is correct
- review the profile artifacts together before using them as a project operating contract
