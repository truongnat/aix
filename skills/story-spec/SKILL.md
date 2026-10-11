---
name: story-spec
description: >-
  BA story layer: Cockburn usecase, backlog user stories, or Given/When/Then AC
  (modes usecase|userstory|ac). Aliases /usecase /userstory /ac. Prefer
  sk-business-analysis for full Lite/Full Spec-quality gate. (Hard contract.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "requirements,stories"
  roles: "reasoner"
  compatible: "claude,cursor,codex,gemini"

---

# Story spec (use case / story / AC)

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Deepen **one** story-layer artifact. For Path=Lite/Full with open Spec quality
needs, run or resume `sk-business-analysis` first.

## Modes

| Mode | Alias | Output |
| --- | --- | --- |
| `usecase` | `/usecase` | `USECASE.md` |
| `userstory` | `/userstory` | `USER_STORIES.md` |
| `ac` | `/ac` | `AC.md` |

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (the skill-local `steps/` directory).
Invoking it **is** executing every step below, in order, one at a time.

| Rule | Requirement |
| --- | --- |
| Invoke | Read `steps/step-01-init.md` immediately, finish it, then open the next step file. |
| Sequence | Finish each step, update the **progress checklist** in ``artifacts/<task-id>/PROGRESS.md`` with evidence, then read the next file. |
| No skipping | NEVER skip a step, never jump straight to the final artifact, never claim complete while any ledger row is `todo`/`blocked`. |
| Blocked | A `blocked` step stops the skill: ask (Confirm-first), resume from the earliest incomplete step. |

| Step | File | Output |
| --- | --- | --- |
| 01 | [step-01-init.md](./steps/step-01-init.md) | Init (mode + ledger) |
| 02 | [step-02-frame.md](./steps/step-02-frame.md) | Frame (inputs + scope) |
| 03 | [step-03-fill.md](./steps/step-03-fill.md) | Fill (produce artifact) |
| 04 | [step-04-self-check.md](./steps/step-04-self-check.md) | Self-check & handoff |

## Contract (mandatory)

| Field | Requirement |
|-------|-------------|
| preferred_role | `reasoner` |
| Inputs | Mode, epic/feature context, actors, related BA/PRD/SRS IDs. |
| Outputs | One mode file seeded from the matching template. |
| Safety | Do NOT write vague AC (“works”, “as per spec”). Do NOT skip alternate/exception flows on usecases. Do NOT invent business rules. **Confirm-first** on Blocking scope. |

### Required artifacts

Templates: `USECASE.template.md`, `USER_STORIES.template.md`, `AC.template.md`.

Shared: executive_summary, developer_overview, mode, trace_ids, open_questions, handoff.

## Workflow (detailed mechanics — order enforced by the step files)

1. Confirm mode.
2. Seed template; link US/AC/UC/BR IDs.
3. For `ac`, use Given / When / Then (prose language from settings; keywords stay English).

## Quality Standards

- [ ] Correct mode file; GWT AC testable.
- [ ] Usecase has main + ≥1 extension/exception when realistic.
- [ ] Stories have actor/need/value + priority.
      (or `no repository changes are required`).

## Output

Produce a reusable story spec artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-story-spec`** owns user-story decomposition: actor, user goal, behavior slices, acceptance criteria, examples, and story-level edge cases. Use it when the requested artifact is a small, testable unit of product behavior rather than a whole-system specification.

It does **not** own system architecture, detailed UI layout, end-to-end user navigation, implementation planning, test execution, or final verification. Route system behavior to `sk-specify`, navigation sequences to `sk-user-flow`, screen structure to `sk-ux-wireframe`, and test evidence to `sk-tester`/`sk-verify-pro`.

**Primary artifact:** a story packet with acceptance criteria and examples ready for planning or implementation. **Handoff:** pass criteria to `sk-planning` and testable examples to `sk-tester`.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
