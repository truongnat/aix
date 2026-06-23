---
name: brainstorming
description: Use when a request names a goal but not a shape ("make X better", "fix Y somehow"), or when more than one defensible approach exists and picking wrong is expensive to undo.
metadata:
  version: 0.2.0
---

## Skill name

brainstorming

## Instruction

Most requests arrive shaped by what's easy to say, not what's actually needed. This skill turns a vague ask into a short, falsifiable brief — a stated problem, confirmed constraints, 2-3 compared options, and exactly one recommendation — before any code, doc, or config change starts.

## When to use

- the request names a goal but not a shape ("make the install flow better", "fix this somehow")
- more than one defensible approach exists and picking wrong is expensive to undo
- no current plan exists for this area, or the existing one no longer fits the request

## When not to use

- the goal, constraints, and approach are already pinned down in a doc, ticket, or prior brief
- a valid plan already exists — go execute it, don't re-derive it
- the task is pure review, verification, or reading with no decision to make

## Inputs

- the raw request, as given, not a paraphrase of it
- confirmed repo state that any option must not break (e.g. `.harness.json`, `HARNESS_CONTRACT_LEVEL`, provider output contracts)
- any prior brief or decision already on record for this area

## Workflow

1. Restate the request as a concrete problem: the symptom or gap, not the feature wish.
2. Separate confirmed constraints (existing contracts, conventions, compatibility requirements) from things that are merely assumed.
3. List at most 2-3 realistic options, one line each, scored with `references/decision-framework.md`.
4. Recommend exactly one option, with the specific reason it fits this repo — not a generic best practice.
5. Fill `assets/brief-template.md` per `FORMS.md` (or run `scripts/new-brief.sh <slug>`), then stop. Do not start implementing.

## Operating Principles

- Clarify before committing — a wrong early assumption is the most expensive bug in the whole task.
- The smallest reversible option beats the most complete-looking one.
- Tradeoffs stay short: one line per option, not a debate.
- An assumption is not a constraint until it has been confirmed against actual repo state.

## Output Contract

This skill must produce a filled brief containing:

- a restated, concrete problem statement
- constraints and success criteria, explicitly separated from assumptions
- 2-3 compared options with exactly one recommendation

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "It's obviously the right approach, no need to compare" | A single-option "comparison" is how an unreviewed assumption becomes a constraint. Name at least one alternative, even to reject it explicitly. |
| "I'll just start the smallest change while I think it through" | That's implementation, not brainstorming. The brief is the deliverable; no code changes belong in this skill. |
| "The user's wording already implies the constraints" | Wording implies intent, not constraints. Confirm constraints against the repo's actual state before relying on them. |

## Checklist Before Done

- [ ] The problem statement names a concrete symptom or gap, not just the feature wish
- [ ] Constraints are confirmed against repo state, not assumed
- [ ] 2-3 options were compared — not zero, not five
- [ ] Exactly one option is recommended with a repo-specific reason
- [ ] The brief is saved (template filled or `new-brief.sh` run) and no implementation has started

## Example

Request: "make the install flow better."

Brief: problem restated as "install always overwrites an existing `.ai-harness/` silently, with no resume or force path"; constraints confirmed from `lib/check-harness-exist.ts` (must keep checking `.harness.json` before any write) and `HARNESS_PROVIDERS` (must stay provider-agnostic); two options compared — re-run idempotently vs. explicit `--force` flag; `--force` flag recommended because it keeps the existing exist-check behavior intact and only adds one new branch; handed off for implementation planning.

## Output

A filled brief, not prose to the user: problem statement, constraints/success criteria, and exactly one recommended option with its reason — sized to be consumed by whatever does the next implementation step, not read as an end-user explanation.

## References

- `FORMS.md` — guide for filling out a brief
- `assets/brief-template.md` — blank brief template
- `scripts/new-brief.sh` — scaffolds a new brief from the template
- `references/decision-framework.md` — criteria for comparing options
- `../discuss/SKILL.md` — optional review skill when the brief still needs challenge before planning
