---
name: basic-design
description: "Turn an approved DISCUSSION.md direction into system-level design — boundaries, components, flows, interfaces, and data ownership — before detail design or sk-planning. Domain-agnostic; omit unused sections. (Hard contract in this SKILL.md — MUST follow.)"
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "design,architecture"
  roles: "designer"
  compatible: "claude,cursor,codex,gemini"

---

# Basic Design

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Turn an approved direction into a system-level design: what is being built, where boundaries sit, and which parts own which data.

**Before drawing architecture:** run **Doc reality check** — challenge whether
session/wiki sk-docs match the codebase (stale specs, common libs that differ from
prose, missing surfaces). **Stop and ask** on Blocking mismatches; do not design
as if sk-docs were automatically true.

This skill focuses on:

- Capture the chosen recommendation from DISCUSSION.md as design context.
- **Doc reality check** (sk-docs ↔ code) with user confirm when Blocking.
- Define architecture overview and major components.
- Describe main actor or system flows (happy paths only).
- Name external interfaces at purpose level (not full contracts).
- Assign logical data ownership (entities/stores, not full schemas).
- List logical data sources with access mode (read/write/both) when relevant.
- Note major entry points or surfaces in scope (omit if N/A).
- Note relevant NFRs only when they affect design.
- Prepare handoff to sk-detail-design (or sk-research/sk-investigate if blocked).

The goal: lock boundaries before writing implementable contracts or task plans. Stay domain-agnostic — works for APIs, UIs, batches, libraries, CLIs, or mixed systems.

## Dynamic depth

- Include only sections that apply to the task.
- Omit unused optional sections (do not invent filler).
- Mark gaps as Blocking Unknowns; **ask in chat** (Confirm-first) instead of
  finishing BASIC_DESIGN with a long Open questions quiz. Residual non-blocking
  unknowns only after answers are folded into architecture/components/flows.
- Lite Mode: Doc reality (short table) + goal + components + flows + handoff.

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
| 01 | [step-01-init.md](./steps/step-01-init.md) | Init (seed + inputs) |
| 02 | [step-02-doc-reality.md](./steps/step-02-doc-reality.md) | Doc reality check |
| 03 | [step-03-design.md](./steps/step-03-design.md) | Design body |
| 04 | [step-04-self-check.md](./steps/step-04-self-check.md) | Self-check & handoff |

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts.

| Field | Requirement |
|-------|-------------|
| preferred_role | `reasoner` (routing hint for multi-CLI; fallback main). |
| Inputs | DISCUSSION.md with clear recommendation; BA notes if available; **repo inspection**; wiki/HLD under the project documentation settings.location` when sk-docs enabled; sk-investigate findings when useful. |
| Outputs | `BASIC_DESIGN.md` from template (or equivalent) including **Doc reality check**, goal, context, architecture, components, flows, data ownership, optional surfaces/NFRs, open questions, handoff. |
| Safety | Do NOT implement code. Do NOT invent file paths without inspecting the codebase. Do NOT treat sk-docs/wiki as truth without Doc reality check. Do NOT fill architecture/components/flows while Doc reality has Blocking=`Yes` unresolved — **Confirm-first**: STOP immediately, classify Ask method, ask in chat (max 3), then finish with answers — do not ship a design as an open-questions quiz. Do NOT write full contracts (sk-detail-design). Do NOT re-litigate BR — point to BA. Do NOT create PLAN.md. If Path=`Quick`, **stop** and use `sk-quick-fix` (or upgrade Path). |

### Required artifacts

#### `BASIC_DESIGN.md`
- Required: yes
- Prefer seed: `templates/BASIC_DESIGN.template.md`
- **executive_summary** (required, array): Maximum five bullets with direction, key boundaries, top Doc reality finding/risk, and next action.
- **developer_overview** (required, object): Status, Doc reality blockers count, key components/boundaries, open questions, next action.
- **doc_reality_check** (required, object): Table of vital claims with doc evidence, code evidence, verdict (`Match`/`Mismatch`/`Missing-in-docs`/`Missing-in-code`/`Stale`/`Unknown`), Blocking, and Ask user?; plus Clarification checkpoint when any Blocking=`Yes`.
- **charts** (required, array): At least one Mermaid architecture/boundary/flow diagram, or N/A with reason when a diagram adds no value.
- **goal** (required, string): One sentence aligned with DISCUSSION recommendation.
- **context** (required, string): Chosen direction and scope summary from DISCUSSION (and BA if present).
- **architecture_overview** (required, string): Short overview of system shape; optional mermaid for boundaries.
- **components** (required, array): Components/modules with responsibility (real packages when they exist, else mark Proposed).
- **user_or_system_flows** (required, array): Main actor or system flows (happy paths only).
- **data_ownership** (required, array): Logical entities/stores and which component owns them.
- **surfaces_or_entry_points** (optional, array): Major in-scope entry points or surfaces (API routes area, UI areas, jobs, CLI commands, message topics). Omit if single obvious surface.
- **logical_data_sources** (optional, array): Logical data sources with access mode (read / write / both). Names only — no full schemas.
- **shape_sketch** (optional, string): Optional short sketch of interaction or output shape (ASCII or bullets). Omit if flows already enough.
- **interfaces_external** (optional, array): Named external systems, APIs, events, or libraries with purpose only (not full contracts).
- **nfrs** (optional, array): Relevant NFRs only if they affect design.
- **out_of_scope_design** (optional, array): Design topics explicitly deferred or excluded.
- **open_questions** (optional, array): Open questions with blocking flag.
- **handoff** (required, string): Suggested next skill: sk-detail-design, sk-research, or sk-investigate.

### Reference

## Doc reality check (mandatory)

Run **before** architecture/components/flows. ≤5 vital claims the design depends on.

| Check | Rule |
|---|---|
| Locate sources | Session DISCUSSION/BA + wiki HLD/API if sk-docs enabled (`.docmap.md` / Last-synced when present). |
| Inspect code | Real modules/routes/tables for those claims — no invented paths. |
| Verdict | `Match` / `Mismatch` / `Missing-in-docs` / `Missing-in-code` / `Stale` / `Unknown`. |
| Stale wiki | Missing Last-synced or behind HEAD → `Stale`/`Unknown`; ask: trust wiki, trust code, or refresh sk-docs first? |
| Common vs spec | Spec describes flow A but shared/common code does B → `Mismatch`, Blocking unless user accepts. |
| Source of truth | Record in Clarification checkpoint: doc / code / refresh-docs-first. Fold into canonical store (or explicit follow-up) — chat alone is not SSOT. |
| Layers | Do not silent-pick “code wins.” Classify descriptive vs normative vs change-in-flight before asking. |

## When to Use

Use this skill when:

- DISCUSSION.md has a clear recommendation and scope.
- Task needs architecture, module boundaries, or flow structure before coding.
- Multiple components or systems interact and ownership must be clear.
- Need BASIC_DESIGN.md before sk-detail-design or sk-planning.
- Business-analysis is sk-done (or not needed) and technical shape is next.

## When NOT to Use

Do NOT use this skill when:

- Direction is still unclear — use sk-brainstorming first.
- Business rules/AC are unclear and stakeholders must decide — use sk-business-analysis.
- Task is small/clear (Lite skip) — handoff straight to sk-planning or sk-execution.
- User asks for full contracts, field lists, or query specs — use sk-detail-design.
- User asks for task breakdown, DoD, or rollback — use sk-planning.
- User needs code changes — use sk-execution.
- Deep external comparison is needed first — use sk-research.
- Root-cause debugging is needed — use sk-investigate.

## Quality Standards

- [ ] Doc reality check filled **before** architecture/components/flows.
- [ ] No Blocking=`Yes` left unresolved (asked + answered, or user accepted risk).
- [ ] Goal is one sentence aligned with DISCUSSION recommendation.
- [ ] Architecture overview is short; diagram only if it clarifies boundaries.
- [ ] Each component has a clear responsibility (real path or Proposed).
- [ ] Flows cover main paths only — no task IDs or full contracts.
- [ ] External interfaces are purpose-level only.
- [ ] Unused optional sections are omitted (not filled with N/A spam).
- [ ] Open questions mark blocking vs non-blocking.
- [ ] Handoff points to sk-detail-design, or sk-research/sk-investigate if blocked.

- [ ] First-pass readable: concrete names (paths/APIs/IDs); no abstract filler.
- [ ] No leftover `_(TODO)_` or placeholder Mermaid in finished sections.
- [ ] Spec/sk-review findings state finding + evidence + verdict (not essays).

- [ ] Confirm-first: on Blocking need, STOP immediately; classify Ask method (`confirm`/`choice`/`fact`/`table`/`diagram`/`html`); ask that way; finished artifact is not a quiz — residual Open questions non-blocking only (the skill instructions).

## WRONG vs CORRECT

```markdown
// WRONG — design from 画面設計書 alone, never opened the repo
Components: PrintService owns PDF (as in design doc §3).

// CORRECT — Doc reality first + visualize Blocking conflict
| Claim | Doc | Code | Verdict | Blocking |
| Print via ExcelCreator | 帳票設計書 RBD… | src/.../CommonPrint uses different pipeline | Mismatch | Yes |
Ask method=diagram: two-path Mermaid (sk-docs vs code), highlight diverge node;
options: follow doc / follow code / refresh sk-docs / sk-investigate.
```

```markdown
// WRONG — detail dumped into basic design
POST /api/items body: { id: string, name: string, ... 20 fields }

// CORRECT — purpose-level boundary
External: Item Admin API — create/list items in tenant scope.
Ownership: Item Service owns Item; Tenant Master is read-only for this feature.
```

```markdown
// WRONG — forcing UI sections on a library change
Screens: N/A. Controls: N/A. Tabs: N/A.

// CORRECT — omit UI; keep what applies
Components: Parser module, Config loader.
Flows: Load config → parse input → emit result events.
```

## Edge Cases

| Situation | Handling |
|---|---|
| DISCUSSION conflicts with repo patterns | Prefer existing patterns. Doc reality `Mismatch`; visualize + ask which wins. |
| Spec vs common library behavior | Blocking until user chooses doc update vs design-to-code-as-is (diagram preferred). |
| Wiki Last-synced missing/stale | Verdict `Stale`/`Unknown`; ask refresh sk-docs vs trust code (`confirm`/`choice` OK if no behavior claim). |
| Blocking unknown | Stop short of fake design. Handoff to sk-research or sk-investigate. |
| Single-module change | Lite Mode — short Doc reality table; skip unused optional sections. |
| Multi-artifact pack (hub + children) | One BASIC_DESIGN with surfaces list; sk-detail-design may split per surface later. |
| No BA notes but rules implied | Mark as assumptions; do not invent BR IDs. |

## Limitations

- Does NOT implement code.
- Does NOT replace sk-brainstorming when direction is unclear.
- Does NOT replace sk-business-analysis for requirements.
- Does NOT produce full contract/query/field detail (use sk-detail-design).
- Does NOT produce PLAN.md task breakdown (use sk-planning).
- Does NOT invent file paths without inspecting the codebase.
- Does NOT accept documentation as correct without Doc reality check.
- Does NOT hardcode a product domain, screen type, or stack.

## Output

Produce a reusable basic design artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-basic-design`** owns system-level design direction after the problem is stable: major components, module/data ownership, system flows, architectural constraints, and the boundary decisions that shape implementation.

It does **not** own unresolved product discovery, implementable field-level contracts, code, or release verification. Route ambiguity to `sk-discussing-pro`/`sk-business-analysis`, detailed contracts to `sk-detail-design`, and evidence decisions to `sk-verify-pro`.

**Primary artifact:** `BASIC_DESIGN.md` with architecture shape, component responsibilities, ownership boundaries, key flows, and known constraints. **Handoff:** pass approved system shape to `sk-detail-design` or `sk-planning`.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
