---
name: user-flow
description: >-
  BA sk-user-flow analysis: happy path, error path, and edge cases for a journey.
  Alias /sk-user-flow. Writes USER_FLOW.md with optional Mermaid. (Hard contract.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "user-flow,requirements"
  roles: "reasoner"
  compatible: "claude,cursor,codex,gemini"

---

# User flow

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Describe how a user completes a goal across screens/steps, including failures
and edges. Does **not** draw full Figma/wireframes (P1).

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
| Inputs | Goal, persona/actor, entry point, related US/UC/AC, known constraints. |
| Outputs | `USER_FLOW.md` from template. |
| Safety | Do NOT omit error path when auth/payment/submit exists. Do NOT invent screens without marking Assumption. **Confirm-first**. |

### Required artifacts

#### `USER_FLOW.md`
- Seed `templates/USER_FLOW.template.md`
- executive_summary, developer_overview, goal, actor, entry,
  happy_path, error_paths, edge_cases, optional mermaid, trace_refs,
  open_questions, handoff

## Workflow (detailed mechanics — order enforced by the step files)

1. Confirm goal + actor.
2. List happy steps; then errors; then edges.
3. Optional Mermaid `flowchart`.
4. Commit Work.

## Quality Standards

- [ ] Happy + error + edge present (or N/A + reason).
- [ ] Steps observable (UI/API outcome).
      (or `no repository changes are required`).

## Output

Produce a reusable user flow artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-user-flow`** owns task and navigation sequences: entry conditions, user actions, branching, success paths, recovery paths, and exit states across screens or system steps.

It does **not** own screen layout, visual styling, detailed requirements, implementation, test execution, or final verification. Route screen composition to `sk-ux-wireframe`, story behavior to `sk-story-spec`, formal constraints to `sk-specify`, and evidence to `sk-tester`/`sk-verify-pro`.

**Primary artifact:** a flow map or step table with branches, failure recovery, and assumptions. **Handoff:** pass the flow to wireframing and story specification; pass measurable outcomes to test planning.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.

## Wave 3 evidence pack

Read [`references/wave3-evidence-pack.md`](./references/wave3-evidence-pack.md) when the task requires the Wave 3 positive/negative fixture and evidence packet. The skill prepares bounded evidence; `sk-verify-pro` owns the final claim-to-evidence decision.
