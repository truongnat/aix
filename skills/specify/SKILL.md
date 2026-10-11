---
name: specify
description: >-
  BA sk-specify: produce product/requirements project documentation by mode — prd, roadmap,
  discover, urd, brd, prd-epic, or srs. Task artifacts with shared IDs and
  Confirm-first. Use when the user asks for PRD/BRD/URD/SRS/roadmap/discovery
  or aliases /prd /roadmap /discover /urd /brd /prd-epic /srs.
  (Hard contract in this SKILL.md — MUST follow.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "requirements,product-docs"
  roles: "reasoner"
  compatible: "claude,cursor,codex,gemini"

---

# Specify (BA requirements project documentation)

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Author **one** requirements document for the chosen **mode**. Do not dump every
mode into one file. Reuse prior task artifacts and memory; keep trace IDs
stable (`FR-*`, `NFR-*`, `EPIC-*`, `US-*`).

## Modes (pick exactly one)

| Mode | Alias | Output file | Use when |
| --- | --- | --- | --- |
| `prd` | `/prd` | `PRD.md` | Whole-product vision, users, feature list |
| `roadmap` | `/roadmap` | `ROADMAP.md` | Now / Next / Later prioritization |
| `discover` | `/discover` | `DISCOVER.md` | Idea needs interview/validation / go-no-go |
| `urd` | `/urd` | `URD.md` | Personas, needs, journeys |
| `brd` | `/brd` | `BRD.md` | Business goals, scope, risks, ROI |
| `prd-epic` | `/prd-epic` | `PRD_EPIC.md` | One capability/epic + P0/P1/P2 + release |
| `srs` | `/srs` | `SPEC_SRS.md` | Task FR/NFR/rules/error matrix (wiki SRS → `project documentation`) |

If mode is unclear → **Confirm-first** (`choice`) before writing.

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (`the skill-local `steps/` directory`).
Invoking it **is** executing every step below, in order, one at a time.

| Rule | Requirement |
| --- | --- |
| Invoke | Read `steps/step-01-init.md` immediately, finish it, then open the next step file. |
| Sequence | Finish each step, update the **progress checklist** in the mode artifact with evidence, then read the next file. |
| No skipping | NEVER skip a step, never jump straight to the finished requirements, never claim complete while any ledger row is `todo`/`blocked`. |
| Blocked | A `blocked` step stops the skill: ask (Confirm-first), resume from the earliest incomplete step. |

| Step | File | Output |
| --- | --- | --- |
| 01 | the detailed instructions in this skill | Mode confirmed + template seeded |
| 02 | the detailed instructions in this skill | Frame sections + trace IDs + unknowns resolved |
| 03 | the detailed instructions in this skill | Full requirement artifact |
| 04 | the detailed instructions in this skill | Gates + commit + handoff |

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts.

| Field | Requirement |
|-------|-------------|
| preferred_role | `reasoner` |
| Inputs | Mode (required), product/feature context, stakeholders, existing DISCUSSION/BUSINESS_ANALYSIS/project reference/memory, constraints. |
| Outputs | Exactly one mode artifact under `artifacts/<task-id>/`, seeded from the matching template. |
| Safety | Do NOT invent stakeholder decisions. Do NOT treat assumptions as facts. Do NOT mix modes in one file. Do NOT replace `sk-business-analysis` Spec quality for lifecycle stories/AC when Path=Lite/Full needs that gate — hand off or run BA. **Confirm-first** on Blocking unknowns. |

### Required artifacts

Seed from `templates/<MODE>.template.md` into the Output file above.

Shared required sections (all modes):

- **executive_summary** (≤5 bullets)
- **developer_overview** (Status, Mode, Open blockers, Next action)
- **mode** (required enum above)
- **trace_ids** (stable IDs introduced or reused)
- **open_questions** (Question, owner, Blocking)
- **handoff** (next skill/mode)

Mode-specific required bodies: see the seeded template.

Use `references/specification-mode-and-decision-records.md` to select exactly one mode, preserve stable trace IDs, and record options, rationale, consequences, owners, and superseded decisions.

### Reference

Templates in `templates/` are authoritative for section shape.

## Workflow (start here)

Start at `steps/step-01-init.md`; the skill-local step files define the ordering. The step sequence covers: mode confirm +
seed → frame (inputs/trace IDs/unknowns) → fill → self-check/commit.

## Quality Standards

- [ ] Single mode; correct output filename.
- [ ] Template sections filled or `N/A` + reason (never silent delete).
- [ ] Assumptions ≠ requirements; Blocking questions asked in chat.
- [ ] Trace IDs unique and linked where features/stories/FRs appear.

## Handoff

| After | Often next |
| --- | --- |
| `discover` go | `sk-specify` `prd` / `sk-brainstorming` |
| `prd` / `brd` / `urd` | `sk-business-analysis` or `sk-story-spec` |
| `prd-epic` | `sk-biz-model` / `sk-user-flow` / `sk-story-spec` |
| `srs` | `project documentation` (wiki) or `sk-basic-design` |
| `roadmap` | sk-planning / epic sk-specify |

## Output

Produce a reusable specify artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-specify`** owns formal product or system specifications: scope, actors, behaviors, constraints, invariants, edge cases, non-functional requirements, and explicit acceptance rules across a feature or system boundary.

It does **not** own story slicing, visual layout, user navigation, implementation planning, test execution, or release verification. Route story-sized work to `sk-story-spec`, navigation to `sk-user-flow`, layout to `sk-ux-wireframe`, planning to `sk-planning`, and evidence decisions to `sk-verify-pro`.

**Primary artifact:** a specification with normative requirements, assumptions, examples, exclusions, and acceptance criteria. **Handoff:** pass the stable contract to planning and the acceptance rules to implementation/test owners.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
