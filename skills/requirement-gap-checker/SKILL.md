---
name: requirement-gap-checker
description: "Review a spec/requirement before test design to find ambiguity, missing details, and contradictions. Use when the user just received a new spec/feature and wants to verify they understand it fully and correctly BEFORE writing test cases — instead of discovering gaps mid-design."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,requirements,spec-review,gap-analysis"
---

# Requirement Gap Checker

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If review files are created, store them under:

```text
artifacts/YYYY-MM-DD/requirement-gap-checker/HHmmss-feature-slug/
```

Every artifact must record `Session timestamp`, the source requirement, the gap table, blocking impact, and questions for PM/dev. All main chat output must also show `Session timestamp`.

## Goal
Read a raw spec — possibly messy, abbreviated, or incomplete — and clearly mark where it is NOT clear enough to test, BEFORE test design starts. This avoids the classic waste of writing cases and then discovering a wrong understanding.

## Support scripts
If the requirement arrives via URL or file, prefer `--report` mode first:

- `safe_download.py` for specs at a URL
- `read_pdf.py` for PDF files
- `read_docx.py` for Word `.docx`
- `read_excel.py` for CSV/XLSX rule tables or decision tables
- `redact_sensitive.py` if the file contains real data

## Core principle
NEVER fill gaps with the assistant's own guesses. The job is to POINT AT holes — filling them belongs to PM/dev, or to the user after asking them. A gap table full of "MISSING" on a thin spec is the CORRECT result, not a skill failure.

## Process

### Step 1 — Read and partition the spec
If the spec is a PDF, run `read_pdf.py --report` first to check text extractability and page count. For `.docx`, `read_docx.py --report` for paragraph/table structure. For CSV/XLSX, `read_excel.py --report` to identify which columns are fields, rules, actors, or statuses.

Then partition the content into: main purpose, actors/roles, inputs/fields, processing flow, business constraints, error/exception conditions (if stated).

### Step 2 — Sweep the gap checklist
Mark each item `MISSING` / `AMBIGUOUS` / `CONTRADICTION`, and rate impact:

- `BLOCKER` — no meaningful test case can be written until clarified
- `HIGH` — partial cases possible, but logic will likely be wrong or key cases missed
- `MEDIUM` — main cases writable; clarification improves coverage
- `LOW` — minor question, doesn't block test design

**Scope**
- Does it say what the feature does AND why?
- Which platforms does it apply to (web/app/both)?
- What is explicitly out of scope?

**Actors and permissions**
- Are all relevant roles/user types listed?
- For each role: what CAN it do / what can it NOT do? (Common gap: spec describes the admin path, silent on regular users.)

**Data and input**
- Per field: required or optional? type? limits (min/max/format)? default value?
- How are invalid inputs handled — or does the spec only describe the happy path?
- Vague adjectives are AMBIGUOUS: "large file", "reasonable time", "soon" — what are the numbers?

**Business logic**
- Multiple states: all states named, all transitions + conditions stated? ("status changes to approved" — from which states? by whom?)
- Special cases mentioned but unexplained: "special cases handled separately" — HOW?
- Contradictions between sections (flow says X, table says Y).

**Related systems**
- Dependencies on or impact to other features — stated?
- Performance, volume limits, concurrency requirements — any numbers?

### Step 3 — Output in two parts

**Part 1: Gap table**

`Session timestamp: [YYYY-MM-DD HH:mm:ss Z]`

| Item | Status | Impact | Issue | Question for PM/dev |
|---|---|---|---|---|
| Roles | MISSING | BLOCKER | Only admin flow described | "Can regular users perform this action, or view-only?" |

Write each question so it can be pasted straight into a chat to PM/dev — specific, answerable, not "please clarify the spec."

**Part 2: Readiness summary**
- Can test-case writing start now?
- Gap count per impact level.
- Top 3 questions to ask first if time is short.

## Anti-patterns
- Inventing plausible details so the spec "looks complete" — if it isn't written, it's a gap.
- Marking every unclear line BLOCKER — reserve it for things that truly stop test design.
- Vague questions ("what about edge cases?") — each question must name the exact gap.
- Skipping the review because the spec is long — long specs hide MORE contradictions, not fewer.
