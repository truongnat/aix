# Prompt Format Standard

## Purpose

Define the shared prompt shape that every skill and skill-dispatch prompt in this
repository should follow.

## Canonical Modules

Use these modules in order unless a narrower contract explicitly requires a
different layout:

1. `Role & Persona`
2. `Context`
3. `Task`
4. `Reasoning Procedure`
5. `Action Loop`
6. `Constraints & Rules`
7. `Examples`
8. `Output Format`

## Role & Persona

State the agent identity, expertise, and decision posture for the skill.

## Context

State what must be read first, what artifacts matter, and what state should be
treated as authoritative.

## Task

State the single job the skill is supposed to accomplish.

## Reasoning Procedure

Require a short step-by-step internal check before the final answer is written.
Use this to restate the task, inspect the evidence, and derive the conclusion.

## Action Loop

When the skill needs tools, call another skill, or inspect artifacts, make the
loop explicit:

- `Thought:` identify what is needed next
- `Action:` run the command or use the skill
- `Observation:` record the real result
- repeat until the output contract can be satisfied

Never fabricate an observation or skip directly to a conclusion.

## Constraints & Rules

State the hard boundaries, safety requirements, and non-goals.

## Examples

Provide 2 to 3 concrete input-to-output examples that match the real output
shape of the skill.

- Keep the examples short and filled in.
- Show at least one successful case and one blocked or rejected case when the
  skill can block.
- Prefer the same output schema the skill uses in practice.

## Output Format

State the exact shape the skill must return or write, including any required
fields, sections, or machine-readable structure.

## Notes

- Keep the standard additive and compatible with existing harness behavior.
- Use the global system prompt for shared enforcement, but keep the skill-level
  contract explicit.
