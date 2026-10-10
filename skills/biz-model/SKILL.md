---
name: biz-model
description: >-
  BA business diagrams: sequence, activity, swimlane, bpmn, state, erd,
  usecase-diagram, d2-erd, d2-activity, d2-architect, dbdiagram. Formats
  mermaid|plantuml|d2|dbml. Offline source for paste into D2/dbdiagram.io.
  (Hard contract — MUST follow.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# Biz model (BA diagrams)

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Produce **one** diagram package for a business/system concern. Prefer diagrams
that trace to FR/US/AC IDs already in the task artifacts.

## Modes

| `diagram` | Alias | Default format |
| --- | --- | --- |
| `sequence` | `/sequence` | mermaid |
| `activity` | `/activity` | mermaid |
| `activity-swimlane` | `/activity-swimlane` | plantuml |
| `bpmn` | `/bpmn` | mermaid (BPMN-like) + Camunda/Bizagi limits |
| `state` | `/state` | mermaid |
| `erd` | `/erd` | mermaid |
| `usecase-diagram` | `/usecase-diagram` | mermaid |
| `d2-erd` | `/d2-erd` | d2 |
| `d2-activity` | `/d2-activity` | d2 |
| `d2-architect` | `/d2-architect` | d2 |
| `dbdiagram` | `/dbdiagram` | dbml |

`format`: `mermaid` | `plantuml` | `d2` | `dbml`.
D2/DBML are **source for external renderers** (d2 CLI / dbdiagram.io). Do not claim
in-repo live preview unless the tool is actually available.

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
| Inputs | `diagram` mode, subject, actors/entities, related IDs, format preference. |
| Outputs | Task artifact `MODEL.md` with one primary diagram fenced block (+ optional `.d2`/`.dbml` sidecar). |
| Safety | Do NOT invent systems/actors. Do NOT claim Camunda XML or live D2 render without evidence. **Confirm-first** on Blocking unknowns. |

### Required artifacts

#### `MODEL.md`
- Seed `templates/MODEL.template.md`
- executive_summary, developer_overview, diagram, format, subject,
  actors_or_entities, trace_refs, diagram_source, legend, open_questions,
  limitations, handoff

Optional sidecars in the task artifact directory: `diagrams/<slug>.d2` or `diagrams/<slug>.dbml`.

## Workflow (detailed mechanics — order enforced by the step files)

1. Confirm `diagram` (+ format).
2. Gather actors/entities; list `trace_refs`.
3. Write fenced source in `MODEL.md`; for d2/dbml also write sidecar when useful.
4. State paste/render instructions in Limitations.

## Quality Standards

- [ ] One primary diagram; headings English.
- [ ] Happy path + key branches when applicable.
- [ ] Trace refs when IDs exist.
- [ ] Limitations honest (no fake Camunda/D2 render).
- [ ] Work commit complete.

## Output

Produce a reusable biz model artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary

**`sk-biz-model`** owns **business and system diagram modeling, traceability from requirements to visual artifacts, and honest format limitations**. It does not own **general product strategy, implementation of rendering infrastructure, or undocumented live-preview claims**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-biz-model`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- diagram mode, subject, actors/entities, source requirement IDs, format preference, and known renderer constraints.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-business-analysis/sk-specify for source requirements; sk-architecture-patterns for architecture decisions; sk-docs for publication; relevant diagram renderer only when available.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
