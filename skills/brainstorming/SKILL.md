---
name: brainstorming
description: >-
  Step workflow: seed DISCUSSION.md template then fill frame → scope/options →
  recommendation → self-check. Clarify direction before design/sk-planning.
  (Hard contract in this SKILL.md — MUST follow.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "discovery,ideation"
  roles: "reasoner"
  compatible: "claude,cursor,codex,gemini"

---

# Brainstorming

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Turn an initial request into a clear direction via a **forced step sequence**:

1. Seed `DISCUSSION.md` from template
2. Frame goal / facts / assumptions; **Spec quality sk-review**; triage issues; **stop and ask**
   on unresolved critical/blocking/Spec-quality items
3. Scope + options matrix (only after Spec quality gate passes)
4. Finalize recommendation + handoff
5. Self-check the decision gate and progress checklist

Do not invent PLAN/TASKS or implement code here.

## Workflow architecture (mandatory)

- Read **one** step fully; finish it before the next.
- Keep the **progress checklist** in `DISCUSSION.md` updated every step.
- **NEVER** jump to recommendation before frame + Spec quality + scope/options.
- **NEVER** skip Spec quality sk-review (Feasibility / Correctness / Capability).
- **NEVER** continue past step-02 while a Critical issue, blocking unknown, or
  blocking Spec quality finding is unresolved. Ask focused questions and wait
  for the user.
- Each step has a **Precondition**. If it fails, return to the previous step —
  do not “catch up” by filling later sections first.

| Path | Role |
|------|------|
| [templates/DISCUSSION.template.md](./templates/DISCUSSION.template.md) | Seed for session `DISCUSSION.md` |
| [templates/VISUAL_DECISION.template.html](./templates/VISUAL_DECISION.template.html) | Optional visual decision aid (CDN + dual load) |
| the detailed instructions in this skill | Copy template into session |
| the detailed instructions in this skill | Goal, facts, Spec quality sk-review, triage |
| the detailed instructions in this skill | Scope + options matrix |
| the detailed instructions in this skill | Recommendation, risks, handoff |
| the detailed instructions in this skill | Self-check the decision gate before ending |

### Execution entry

**Start here:** Read and follow the detailed instructions in this skill immediately after this Contract.

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action.

| Field | Requirement |
|-------|-------------|
| preferred_role | `reasoner` (routing hint for multi-CLI; fallback main). |
| Inputs | Initial request, repo context, existing documents, constraints, current behavior, desired outcome, stakeholder feedback if available. |
| Outputs | Session `DISCUSSION.md` seeded from template, with issue/visual triage and clarification decisions; optional `VISUAL_DECISION.html`. |

### Required artifacts

#### `DISCUSSION.md` (from template)
progress checklist, executive_summary, developer_overview, charts, goal_and_outcome,
context (facts + constraints + assumptions), issue_triage, clarification_checkpoint,
spec_quality_sk-review, visual_triage, scope (in + out + non-goals),
options_and_recommendation, risks, handoff.

#### `VISUAL_DECISION.html`
- Required: no.
- Use only for issues classified `html-recommended` and confirmed by the user.
- Show the decision question, alternatives/states, differences, risks, and the
  decision requested. It is a decision aid, not production UI.
- Must include Tailwind CDN + anime.js CDN tags so static open still renders;
- Viewing works statically; recording a choice needs

### Reference

## Forbidden outputs (reject / rewrite)

| Failure | Fix |
|---------|-----|
| No template seed | Restart step-01 |
| Chat-only brainstorm | Write `DISCUSSION.md` |
| progress checklist skipped / later step `sk-done` while earlier `todo`/`blocked` | Fix ledger; return to earliest incomplete step |
| Assumptions labeled as facts | Move to Assumptions / Unknowns |
| Continued with unresolved Critical/blocking issue | Stop, ask focused questions, wait for answers |
| Specs accepted without feasibility/correctness/capability sk-review | Fill Spec quality sk-review; ask blocking gaps |
| Scope/options filled before Spec quality sk-done | Return to step-02; clear premature scope if needed |
| Generated HTML for every issue | Triage first; use table/diagram/text when sufficient |
| No recommendation or no handoff skill | Complete step-04 |
| “No blockers” while blocking Unknowns remain | List them under Handoff Blockers |
| Jumped to sk-planning/design in this skill | Stop; handoff only |

## When to Use / NOT

**Use when:** unclear goals/scope, multiple approaches, need DISCUSSION.md before design/sk-planning.

**Do NOT use when:** tiny clear fix, already have DISCUSSION and user wants sk-execution, pure debug/sk-review, needs BA/design/sk-research as the primary skill.

## Lite Mode / Quick path

**Quick** (tiny clear fix): user may skip this skill and go to sk-planning with a
short goal, or produce a minimal DISCUSSION (Goal + Facts + Recommendation +
Handoff) without Spec quality matrices. Record `Path: Quick` in Developer overview.

**Lite:** still run **all five steps**. Keep sections short; options may be 1–2
rows; Spec quality can be one concrete finding per table.

**Full:** default when product/architecture is unclear.

### Facilitation (BMAD-inspired)

- **Diverge then converge:** do not lock Recommendation while still gathering
  facts/options. Step-03 = diverge (scope/options); step-04 = converge.
- **One focused question per chat message** while clarifying (exception: up to
  three independent `confirm`/`choice`/`fact` blockers in one round). Classify
  **Ask method** first. No multi-choice walls that invite lazy picking; no
  `html` for abstract strategy.

## Quality Standards

- [ ] Goal is one sentence.
- [ ] Facts / assumptions separated in Context section.
- [ ] Issues classified by severity and blocking status in Issue triage.
- [ ] Spec quality sk-review covers Feasibility, Correctness, and Capability (own section, before Scope in).
- [ ] Focused questions and answers recorded in Clarification checkpoint.
- [ ] No unresolved Critical/blocking issue or blocking Spec quality finding was bypassed; questions and answers are recorded.
- [ ] HTML is used only when spatial/state comparison materially improves the decision (Visual triage).
- [ ] Scope in and out separated (Scope in / Scope out sections).
- [ ] Options matrix used; recommendation has reason + confidence (within Options & Recommendation).
- [ ] Handoff names one next skill.
- [ ] `DISCUSSION.md` on disk; step-05 self-check completed.

- [ ] First-pass readable: concrete names (paths/APIs/IDs); no abstract filler.
- [ ] No leftover `_(TODO)_` or placeholder Mermaid in finished sections.
- [ ] Spec/sk-review findings state finding + evidence + verdict (not essays).

- [ ] Confirm-first: on Blocking need, STOP immediately; classify Ask method (`confirm`/`choice`/`fact`/`table`/`diagram`/`html`); ask that way; finished artifact is not a quiz — residual Open questions non-blocking only (the skill instructions).

## Limitations

- Does NOT implement code or replace sk-planning/design/BA.
- Does NOT auto-confirm assumptions.
- Small/clear tasks may Lite-skip later design in **handoff text**, still produce DISCUSSION.md via steps.

## Visual triage rubric

This table is the **visual subset** only (`diagram` / `html`):

| Need | Ask method | Use |
|---|---|---|
| Simple factual / Yes-No / pick one | `confirm` / `fact` / `choice` | Chat — no visual |
| Multi-criteria option compare | `table` | Markdown table in chat |
| Architecture, sequence, state, or data flow | `diagram` | Mermaid/diagram |
| UI layout, responsive, before/after, multi-state, spatial options | `html` | `html-recommended` → ask-before-create → VISUAL_DECISION.html |
| No decision benefit from a visual | — | `none` |

Do not confuse “complex” or “abstract” with “needs HTML.” HTML is justified
only when a **spatial** representation reduces decision ambiguity. Abstract
product strategy → `choice` / `table`, not `html`.

## Output

Produce a reusable brainstorming artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-brainstorming`** owns divergent option generation and selection framing: alternatives, assumptions, trade-offs, decision criteria, and a recommendation candidate before normative requirements or implementation planning.

It does **not** own final requirements, final architecture, task breakdown, code, or verification. Route business decisions to `sk-business-analysis`, normative contracts to `sk-specify`, and clarified discussion to `sk-discussing-pro`.

**Primary artifact:** `DISCUSSION.md` option matrix with facts, assumptions, criteria, rejected alternatives, and recommendation status. **Handoff:** pass the selected direction to `sk-discussing-pro` or the appropriate requirements/design owner.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
