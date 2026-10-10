---
name: excel-doc-convert
description: >-
  Convert messy Excel documents (JP 方眼紙 / 帳票 / 画面設計書, heavy merged
  cells) into HTML (rowspan/colspan) and semantic Markdown with an explicit
  convert-report. Use when the user asks to turn Excel design sk-docs, forms, or
  templates into Markdown/HTML, or mentions merge cells, 方眼紙, 帳票設計書,
  画面設計書, or Excel-as-document (not spreadsheet edit).
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# Excel Doc Convert

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Turn **document-like Excel** (merged layouts, JP templates) into readable
**HTML + Markdown**. This is not lossless Excel editing — use skill `sk-xlsx` for
create/edit/validate of workbooks.

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
| 01 | [step-01-init.md](./steps/step-01-init.md) | Init (setup + ledger) |
| 02 | [step-02-build.md](./steps/step-02-build.md) | Build (inspect / create / edit) |
| 03 | [step-03-verify.md](./steps/step-03-verify.md) | Verify (coverage gate) |

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action.

| Field | Requirement |
|-------|-------------|
| Inputs | Path to `.sk-xlsx` (not `.xls`); optional sheet filter and row/col caps. |
| Outputs | Per-sheet `.html` + `.md`, plus `convert-report.json` listing strategies and limitations. Written under the active session (or a user-named path outside the kit). |
| Safety | Do **not** claim layout-lossless Markdown. Do **not** invent cell values. Do **not** silently drop sheets when converting “all”. Mark shapes/charts/comments unsupported in the report. Prefer HTML for layout sheets. Domain IDs (FBD/RBD, control IDs) stay raw. |

### Required artifacts

#### `convert-report.json`
- **format** (required, string): Must be `sk-excel-doc-convert`.
- **operation** (required, string): `classify` \| `convert`.
- **source** (required, string): Input workbook path.
- **sheets** (required for convert, array): Per-sheet strategy, paths, merge counts.
- **limitations** (required for convert, array): Explicit gaps (shapes, stamps, truncation).

### Reference

- Methods: `references/METHODS.md`
- JP template notes: `references/JP_TEMPLATES.md`

## Runtime

On first use:


`requirements.txt`.

## Workflow (detailed mechanics — order enforced by the step files)

2. `classify` first on unknown workbooks.
3. `convert` with caps; raise `--max-rows` / `--max-cols` only when needed.
4. Open HTML for layout QA; use Markdown for RAG / handoff.
5. For sheet strategy `layout-asset`, treat HTML as primary; MD is a stub + link.
6. Review `convert-report.json` limitations before claiming “complete”.
7. Optional: LLM pass to rewrite MD from HTML/text **without changing numbers/IDs** —
   still keep the report and HTML as evidence.
8. Work nested git: run
   outputs (or confirm the working tree is clean).




## Strategies (built-in)

| Strategy | When | Markdown behavior |
| --- | --- | --- |
| `cover-kv` | 表紙 / cover | Heuristic 項目\|内容 table |
| `control-table` | Detects コントロール名 + コントロールID | № / name / ID table |
| `merged-doc` / `simple-grid` | Default | Structure-aware text blocks |
| `table-dense` | Many merges / wide sheet | Same + expect truncation caps |
| `layout-asset` | レイアウト in title | HTML primary; MD stub |

## Do not

- Use this skill to **edit** formulas or republish `.sk-xlsx` → use `sk-xlsx`.
- Flatten merges into a Markdown table (repeats values across columns).
- Trust cover stamp/approval row pairs without human glance.
- Convert `.xls` / macros as supported.

## Output

Produce a document/media artifact with input and output paths, coverage/quality checks, unsupported-content limitations, validation evidence, and delivery notes.

## Boundary

**`sk-excel-doc-convert`** owns **conversion and extraction of Excel workbooks into documented, reviewable artifacts with structure preservation**. It does not own **general spreadsheet authoring, unsupported workbook features, or business analysis conclusions without evidence**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-excel-doc-convert`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- workbook path, sheet scope, target artifact, formulas/formatting requirements, unsupported-feature policy, and coverage criteria.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-xlsx for workbook fidelity; sk-office-common for office conventions; sk-data-analysis-pro for downstream numeric analysis; sk-docs for publication.

## Wave 3 evidence pack

Read [`references/wave3-evidence-pack.md`](./references/wave3-evidence-pack.md) when the task requires the Wave 3 positive/negative fixture and evidence packet. The skill prepares bounded evidence; `sk-verify-pro` owns the final claim-to-evidence decision.
