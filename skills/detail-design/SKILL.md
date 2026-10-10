---
name: detail-design
description: "Produce implementable design from BASIC_DESIGN.md — contracts, data model, sequences, rules, operations, client mapping when needed — before sk-planning. Domain-agnostic; omit unused sections. (Hard contract in this SKILL.md — MUST follow.)"
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "design,architecture"
  roles: "architect"
  compatible: "claude,cursor,codex,gemini"

---

# Detail Design

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Turn BASIC_DESIGN.md into implementable specs: how in-scope parts fulfill the approved boundaries.

**Before contracts/data model:** re-run **Doc reality check** (BASIC claims +
wiki LLD/API vs code). **Stop and ask** on Blocking mismatches. High-impact
assumptions with `Confirmed?=No` also block handoff until the user answers.

This skill focuses on:

- Re-check Doc reality (sk-docs ↔ code) and confirm Blocking items with the user.
- Contracts for in-scope surfaces (HTTP, RPC, events, CLI, library APIs — whichever applies).
- Data model at key-field level with known/inferred confidence.
- Sequences for the main happy path plus 1–2 error paths when errors matter.
- Validation and rules at design level.
- Structured operations/queries when data access matters (base source, joins/links, filters with operators, sort/group).
- Client or presentation mapping when a consumer UI/CLI/SDK is in scope.
- Error and state handling for callers.
- Optional persistence write-spec and field provenance when outputs or stores need them.
- Traceability to BR/AC when sk-business-analysis exists.
- Explicit gaps when sources are incomplete.
- Handoff to sk-planning (not sk-execution).

The goal: give sk-planning enough precision without inventing architecture or a fixed product domain.

## Dynamic depth

- Include only sections that apply; omit the rest (no forced N/A blocks).
- Prefer structured lists/tables over prose for contracts, operations, and rules.
- Mark every uncertain field or join as inferred (never as known fact).
- If a needed input is missing, list it under `gaps` and do not invent.
- Multi-surface work: one DETAIL_DESIGN with sections per surface, or linked child notes — stay consistent with BASIC surfaces.

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
| Inputs | BASIC_DESIGN.md (required, with Doc reality or re-do it here); DISCUSSION/BA for AC/BR when available; **repo inspection** of existing contracts/handlers/schemas; wiki LLD/API when sk-docs enabled. |
| Outputs | `DETAIL_DESIGN.md` from template (or equivalent) including **Doc reality check**, goal, applicable contracts/models/sequences/rules/operations, optional client mapping and persistence, errors/states, gaps, assumptions (with Confirmed?), handoff to sk-planning. |
| Safety | Do NOT implement code. Do NOT expand scope beyond BASIC_DESIGN.md. Do NOT invent fields/joins as facts — mark inferred. Do NOT fill contracts/data_model while Doc reality Blocking=`Yes` is unresolved — **Confirm-first**: STOP immediately, classify Ask method, ask in chat, then finish with answers — do not ship DETAIL_DESIGN as an open-questions quiz. Do NOT hand off to sk-planning while High-impact assumptions have `Confirmed?=No` without explicit user accept. Do NOT create PLAN.md/task IDs. If Path=`Quick`, **stop** and use `sk-quick-fix` (or upgrade Path). |

### Required artifacts

#### `DETAIL_DESIGN.md`
- Required: yes
- Prefer seed: `templates/DETAIL_DESIGN.template.md`
- **executive_summary** (required, array): Maximum five bullets with implementation direction, key contract/flow, top Doc reality finding/risk, and next action.
- **developer_overview** (required, object): Status, Doc reality blockers, unconfirmed high-impact assumptions, critical contracts/flows, gaps, next action.
- **doc_reality_check** (required, object): Claims/surfaces with doc vs code (known) or Proposed; verdict; Blocking; Ask user?; Clarification checkpoint when needed.
- **charts** (required, array): At least one Mermaid sequence/state/data-flow diagram for the main path, or N/A with reason.
- **goal** (required, string): One sentence linked to sk-basic-design decisions.
- **contracts** (optional, array): In-scope contracts: HTTP/RPC/events/CLI/library APIs with inputs, outputs, and errors. Omit if no external or public surface. Cite existing OpenAPI/handler paths as **known**; new surfaces **proposed**.
- **data_model** (optional, array): Entities/collections, key fields, relations; confidence known or inferred. Omit if no durable data.
- **sequences** (required, array): Main happy path plus 1–2 error paths when errors matter.
- **rules_and_validation** (optional, array): Validation and business-rule application at design level (when, condition, severity or outcome).
- **operations** (optional, array): Structured data/ops access when relevant: base source, joins/links, filters with operators, sort/group, projections.
- **client_mapping** (optional, array): Consumer mapping when UI/CLI/SDK is in scope: inputs/views → contract fields; optional initial state and interaction steps.
- **persistence_spec** (optional, array): Write/update behavior when stores change; or state read-only. Omit if no persistence side effects.
- **field_provenance** (optional, array): When outputs or views need it: display/export field → source field/entity + confidence.
- **error_and_state_handling** (required, array): Error codes/states and how callers or clients should behave.
- **gaps** (optional, array): Missing inputs or undecided details that block or soften the design. Do not invent to fill these.
- **traceability** (optional, array): BR/AC IDs mapped to design sections when BA exists.
- **assumptions** (required, array): Assumptions with risk and confirmation status (`Confirmed?` Yes/No).
- **handoff** (required, string): Suggested next skill: sk-planning. Call out blocking items.

### Reference

## Doc reality check (mandatory)

Run **before** contracts/data_model. Reuse BASIC Doc reality rows; add contract-level claims.

| Check | Rule |
|---|---|
| Known vs proposed | Existing handler/OpenAPI/proto path = **known**; new surface = **proposed**. |
| Spec vs common | Shared helpers/pipelines that contradict 設計書 → `Mismatch`, usually Blocking. |
| Field/join confidence | Inferred stays inferred until confirmed; High risk → ask. |
| Stop gate | Blocking Doc reality or High-impact `Confirmed?=No` → stop and ask (max 3). Prefer `diagram`/`table`/`html` for sk-docs↔code diffs the user must see (SSOT). |
| Wiki drift | Note rows for later `sk-docs` sk-sync; do not silently ignore. |
| Fold | Clarification Accepted source of truth + canonical update/follow-up — chat is not SSOT. |

## When to Use

Use this skill when:

- BASIC_DESIGN.md exists and boundaries are agreed.
- Need implementable contracts, models, sequences, or rules before sk-planning or coding.
- Need DETAIL_DESIGN.md for handoff to sk-planning.
- Need BR/AC → design section traceability.

## When NOT to Use

Do NOT use this skill when:

- BASIC_DESIGN.md is missing or still blocked — use sk-basic-design (or sk-research/sk-investigate).
- Direction is unclear — use sk-brainstorming.
- Business requirements are unresolved — use sk-business-analysis.
- Task is small/clear (Lite skip from sk-brainstorming) — sk-planning or sk-execution is enough.
- User wants task IDs, DoD, verification commands, or rollback — use sk-planning.
- User wants code changes — use sk-execution.

## Quality Standards

- [ ] Doc reality check completed before contracts/data_model.
- [ ] No Blocking Doc reality left unresolved without user answer/accept.
- [ ] High-impact assumptions have `Confirmed?=Yes` or explicit user accept of risk.
- [ ] Goal links to sk-basic-design decisions; no new architecture invented.
- [ ] Only in-scope surfaces get contracts and operations.
- [ ] Data fields and relations mark confidence (known / inferred).
- [ ] Existing contracts cite real paths as known; new ones labeled proposed.
- [ ] Sequences cover main path; error paths when failures matter.
- [ ] Unused optional sections are omitted.
- [ ] Gaps are listed when sources lack detail — not invented away.
- [ ] Handoff is to sk-planning (blocking items called out).

- [ ] First-pass readable: concrete names (paths/APIs/IDs); no abstract filler.
- [ ] No leftover `_(TODO)_` or placeholder Mermaid in finished sections.
- [ ] Spec/sk-review findings state finding + evidence + verdict (not essays).

- [ ] Confirm-first: on Blocking need, STOP immediately; classify Ask method (`confirm`/`choice`/`fact`/`table`/`diagram`/`html`); ask that way; finished artifact is not a quiz — residual Open questions non-blocking only (the skill instructions).

## WRONG vs CORRECT

```markdown
// WRONG — copy 設計書 field list as known schema
Item.code is VARCHAR(20) NOT NULL unique globally.

// CORRECT — Doc reality + confidence
Doc: 帳票項目詳細 lists code length 20.
Code: entity uses string without DB length check (src/.../Item.cs).
Verdict: Mismatch/Unknown — mark inferred; ask data owner before sk-planning.
```

```markdown
// WRONG — inventing schema as fact
Item.code is VARCHAR(20) NOT NULL unique globally.

// CORRECT — confidence labeled
Item.code (inferred): string, unique within tenant — confirm with data owner.
Item.tenantId (known): FK from existing schema.
```

```markdown
// WRONG — forcing UI matrix on a pure API job
Controls / Screens / Tabs: all N/A...

 // CORRECT — omit client mapping; detail the API surface
Contracts: POST /items — 422 on missing required fields.
Operations: base Item; filter tenantId = :id; sort createdAt desc.
```

```markdown
// WRONG — sk-planning dumped into detail design
T-001: Implement. DoD: PR merged.

// CORRECT — design only
Sequence: Client → API → Service → Store; on scope miss return SCOPE_DENIED.
Handoff: sk-planning.
```

## Edge Cases

| Situation | Handling |
|---|---|
| Basic design still blocked | Do not guess. Flag and recommend sk-research/sk-investigate or stakeholder decision. |
| BASIC skipped Doc reality | Run full Doc reality here before contracts. |
| Spec vs common pipeline | Blocking; ask doc vs code-as-is vs sk-investigate. |
| No UI/client in scope | Omit client_mapping. |
| No persistence | Omit data_model / persistence_spec or keep ephemeral structures only. |
| Existing contracts reused | Prefer inspect-repo facts; mark new contracts as proposed. |
| Source incomplete | Record gaps; partial design is OK if handoff states blockers. |
| BA missing | Trace to DISCUSSION; do not invent BR IDs. |

## Limitations

- Does NOT implement code.
- Does NOT expand scope beyond BASIC_DESIGN.md.
- Does NOT replace sk-planning (no task IDs, DoD, rollback).
- Does NOT treat inferred details as confirmed facts.
- Does NOT accept sk-docs as truth without Doc reality check.
- Does NOT re-open architecture without an open question.
- Does NOT hardcode a product domain, UI toolkit, or stack.

## Output

Produce a reusable detail design artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-detail-design`** owns implementable design contracts derived from an approved basic design: models, sequences, states, API/event/CLI rules, field-level constraints, validation, and error paths.

It does **not** own product discovery, system-level architecture choices, implementation code, or final verification. Route scope ambiguity to `sk-business-analysis`/`sk-discussing-pro`, architecture shape to `sk-basic-design`, and delivery evidence to `sk-verify-pro`.

**Primary artifact:** `DETAIL_DESIGN.md` with traceable contracts, rules, sequences, assumptions, and unresolved blockers. **Handoff:** pass the stable contract to `sk-planning` and the relevant stack implementation owner.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions (sk-verification is a compatibility facade only).

## Wave 3 evidence pack

Read [`references/wave3-evidence-pack.md`](./references/wave3-evidence-pack.md) when the task requires the Wave 3 positive/negative fixture and evidence packet. The skill prepares bounded evidence; `sk-verify-pro` owns the final claim-to-evidence decision.
