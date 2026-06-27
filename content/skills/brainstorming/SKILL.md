---
name: brainstorming
description: 'Skill: brainstorming'
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
# brainstorming

## Purpose

Shape a vague request into an implementation-ready direction before detailed planning starts.

## When To Use

- when the goal is real but the solution shape is still fuzzy
- before `writing-plans` on non-trivial feature or refactor work
- when multiple realistic approaches need a concise tradeoff discussion

## When Not To Use

- when the goal, constraints, and preferred approach are already documented clearly
- when the work is already approved and ready for `executing-plans`
- when the task is only verification or review

## Inputs

- current request
- active goal or discussion artifacts
- repo constraints, hazards, and prior decisions when present

## Workflow

1. Restate the problem in concrete engineering terms.
2. Separate confirmed requirements from assumptions.
3. Compare a small number of realistic approaches.
4. Recommend one option and explain why it best fits the current repo.
5. Hand off the clarified direction to discussion or planning artifacts.

## Operating Principles

- Clarify before committing.
- Prefer the smallest viable approach.
- Keep tradeoffs explicit and short.
- Do not invent requirements to make the design feel complete.

## Reasoning Procedure

1. Restate the problem and the decision the user is trying to make.
2. List the concrete constraints and what is still unknown.
3. Compare a few viable directions and note the tradeoffs.
4. Stop and report blocked if the decision depends on missing context.

## Action Loop

- Thought: identify the next constraint, risk, or option that matters.
- Action: inspect the goal artifact or ask one clarifying question.
- Observation: capture the new constraint or choice exactly.
- Repeat until the direction is implementation-ready.

## Examples

### Example 1

Input: We need to add a new eval check without slowing the suite down.

Output:
- Clarified problem: add a lightweight conformance check for prompt examples.
- Constraints: keep validation local, avoid long-running LLM checks, preserve current test speed.
- Recommended approach: add a deterministic eval manifest plus a small conformance test.
- Tradeoff: broader coverage than a heading-only test, but still cheap to run.

### Example 2

Input: The goal is too vague and no success criteria are available.

Output:
- Blocked: missing success criteria and target artifact.
- Needed next step: ask for the desired output shape before proposing options.
## Output Contract

This skill must produce:

- a clarified problem statement
- explicit constraints and success criteria
- a recommended approach with tradeoffs

## Common Failure Modes

- turning brainstorming into implementation
- offering many weak options instead of a recommendation
- treating assumptions as settled requirements

## Checklist Before Done

- [ ] The problem is stated concretely
- [ ] Constraints and success criteria are explicit
- [ ] Alternatives were compared briefly
- [ ] One approach was recommended
- [ ] The result is ready for planning
