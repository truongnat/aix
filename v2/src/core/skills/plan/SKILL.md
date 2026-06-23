---
name: plan
description: Use when a brainstorming brief is approved and ready for implementation, or when an existing plan no longer fits a request that's changed.
metadata:
  version: 0.1.0
---

## Skill name

plan

## Instruction

Turn an approved brief into an ordered, verifiable implementation plan. Visual decisions and the final shape get a preview the user can actually look at, not just a written description.

## When to use

- the brief from `brainstorming` is approved and no plan exists yet for it
- an optional `discuss` review already clarified the brief and now the direction is clear enough to plan
- an existing plan no longer fits because the request or constraints changed
- a decision point has a visual or structural shape that's easier to choose between as a rendered preview than as prose

## When not to use

- no approved brief exists yet — run `brainstorming` first
- the current proposal is still unclear and needs technical challenge before planning — optionally use `discuss` first
- a valid plan already exists for this exact scope — go to `execute`
- the work is read-only review with no implementation ahead

## Inputs

- the approved brief (problem, constraints, recommendation)
- any explicit `discuss` disposition, if that optional review happened
- current repo state for the affected files and systems
- any open visual decision that needs a rendered option set

## Workflow

1. Read the approved brief; do not re-derive the problem from scratch.
2. List the affected files, systems, and artifacts for the recommended option.
3. If a decision point is more easily judged visually than in prose (layout, diagram, structure), invoke `visualize-question` to render the candidate options and capture the user's pick before continuing.
4. Break the work into ordered, small, independently verifiable tasks, each with a defined verification step.
5. Invoke `visualize-result` to render the expected end state and get explicit user confirmation before handing off to `execute`.

## Operating Principles

- The brief is the source of truth for scope — planning narrows it, it doesn't reopen it.
- Visual decisions get a rendered preview, not a text description the user has to imagine.
- Every task in the plan must state how it gets verified, not just what it does.
- A plan nobody confirmed is a draft, not a plan.

## Output Contract

This skill must produce:

- an ordered task list, each with a verification step
- a rendered preview and explicit user confirmation for any visual decision made
- explicit approval status before handoff to `execute`

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "The layout choice is obvious, no need to render it" | Obvious to the author is not obvious to the user seeing it for the first time. Render it. |
| "I'll just describe the result in words instead of previewing it" | Words let scope drift unnoticed. A rendered preview makes the actual shape checkable. |
| "Approval is implied since nobody objected" | Silence is not approval. Get an explicit confirmation before `execute` starts. |

## Checklist Before Done

- [ ] The plan traces back to an approved brief, not a re-derived problem
- [ ] Tasks are ordered, small, and each has a verification step
- [ ] Visual decisions were rendered via `visualize-question`, not just described
- [ ] The expected result was rendered via `visualize-result` and confirmed
- [ ] Approval is explicit, not assumed

## Example

Brief recommends adding a `--force` flag to install. Plan: (1) add flag parsing in `command/install/index.ts`, verified by a unit test on arg parsing; (2) branch the existing-install check on the flag, verified by an integration test overwriting an existing `.ai-harness/`; (3) update CLI help text. No visual decision is needed here, so `visualize-question` is skipped; `visualize-result` renders the new `--help` output for confirmation before `execute`.

## Output

A task list with verification steps attached, plus any rendered preview and the user's recorded confirmation — ready for `execute` to pick up one task at a time.

## References

- `FORMS.md` — guide for filling out a plan
- `assets/plan-template.md` — blank plan template
- `scripts/new-plan.sh` — scaffolds a new plan from the template
- `references/task-sizing.md` — how to size and split tasks
