---
name: pdf
description: >-
  Create, inspect, edit, and validate PDF files with strict supported-lossless
  coverage manifests (Python/pypdf/pdfplumber/reportlab). Use when the user
  mentions PDF, pages, extract text, merge/reorder pages, or PDF metadata.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# PDF

## Purpose

Work with PDF files using the Python CLI under a supported-lossless coverage
contract. OCR and raster checks are optional and must be marked `skipped` when
tools are absent (never a false pass).

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

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts.

| Field | Requirement |
|-------|-------------|
| Inputs | .sk-pdf path and/or JSON create/edit spec; optional manifest path. |
| Outputs | .sk-pdf deliverable for create/edit plus coverage manifest JSON with coverage_ratio=1.0. |
| Safety | Do NOT publish encrypted or XFA PDFs. Do NOT claim OCR success without Tesseract. Mark missing optional tools as skipped, never false-pass. Do NOT silently drop pages/text. |

### Required artifacts

#### `coverage.json`
- Required: yes
- **format** (required, string): Must be sk-pdf.
- **operation** (required, string): inspect | create | edit | validate
- **coverage_ratio** (required, number): Must equal 1.0 before publish.
- **items** (required, array): Coverage inventory entries.

### Reference

## Runtime




## Output

Produce a document/media artifact with input and output paths, coverage/quality checks, unsupported-content limitations, validation evidence, and delivery notes.

## Boundary

**`sk-pdf`** owns **PDF reading, extraction, transformation, OCR, form handling, and integrity validation within supported limits**. It does not own **DOCX-to-PDF conversion ownership, complex layout authoring, or unsupported encrypted/signed content**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-pdf`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- PDF path, operation, text/table/image/OCR goal, password/access constraints, output format, and integrity requirements.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-pdf-pro for advanced PDF workflows; sk-docx/sk-xlsx for source formats; sk-ocr-pro for dense/scanned OCR; sk-docs for content interpretation.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
