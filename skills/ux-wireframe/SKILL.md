---
name: ux-wireframe
description: >-
  BA screen sketches: ASCII (/wireframe-ascii), HTML wireframe
  (/wireframe-html), HTML prototype (/prototype-html), or Figma brief
  (/figma) for design-system handoff — not live Figma drawing. (Hard contract.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "ux,design"
  roles: "designer"
  compatible: "claude,cursor,codex,gemini"

---

# UX wireframe

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Produce **low-fidelity** screen sketches or a **Figma handoff brief**. Live
drawing inside Figma requires user/plugin/token and is out of band.

## Modes

| Mode | Alias | Output |
| --- | --- | --- |
| `ascii` | `/wireframe-ascii` | `WIREFRAME.md` |
| `html` | `/wireframe-html` | `wireframes/*.html` + `WIREFRAME.md` |
| `prototype` | `/prototype-html` | `prototypes/*.html` + `WIREFRAME.md` |
| `figma` | `/figma` | `FIGMA_BRIEF.md` (+ optional links in WIREFRAME.md) |

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (`the skill-local `steps/` directory`).
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
| Inputs | Mode, screens/flow, content fields, design-system notes, optional Figma file URL. |
| Outputs | Mode artifacts under active session. |
| Safety | Do NOT present as final UI. Do NOT claim frames were drawn in Figma unless the user confirms. Do NOT embed secrets. **Confirm-first** on unknown IA. |

### Required artifacts

- ascii/html/prototype → `templates/WIREFRAME.template.md`
- figma → `templates/FIGMA_BRIEF.template.md`

## Workflow (detailed mechanics — order enforced by the step files)

1. Confirm mode + screens.
2. ascii/html/prototype as before.
3. `figma`: list frames, components, tokens, content; link file URL if provided; give copy-paste checklist for designer.

## Quality Standards

- [ ] Screens trace to US/flow IDs when available.
- [ ] Figma mode labeled brief/handoff, not “drawn in Figma”.
- [ ] Work complete.

## Output

Produce a reusable implementation or design artifact with the selected direction/pattern, relevant files or code, responsive/platform behavior, accessibility considerations, verification evidence, risks, and next steps.

## Boundary


**`sk-ux-wireframe`** owns low- and mid-fidelity screen structure: information hierarchy, component placement, interaction affordances, empty/loading/error states, and annotations that communicate intended layout without implementation code or visual polish.

It does **not** own user-task sequencing, product requirements, visual branding, frontend implementation, accessibility certification, or release verification. Route task/navigation sequences to `sk-user-flow`, requirements to `sk-story-spec` or `sk-specify`, and implementation to the relevant frontend skill.

**Primary artifact:** an annotated wireframe set with screen states and open interaction questions. **Handoff:** pass flow assumptions to `sk-user-flow`, acceptance criteria to `sk-story-spec`, and implementation constraints to the frontend/design-system owner.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions (sk-verification is a compatibility facade only).

## Wave 3 evidence pack

Read [`references/wave3-evidence-pack.md`](./references/wave3-evidence-pack.md) when the task requires the Wave 3 positive/negative fixture and evidence packet. The skill prepares bounded evidence; `sk-verify-pro` owns the final claim-to-evidence decision.
