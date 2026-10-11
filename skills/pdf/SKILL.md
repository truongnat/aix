---
name: pdf
description: >-
  Create, inspect, edit, merge/split/rotate, watermark, encrypt, and validate
  PDF files, fill PDF forms, and OCR scanned PDFs — with strict
  supported-lossless coverage manifests (Python: pypdf, pdfplumber, reportlab,
  pdf2image, pytesseract; JS form-filling scripts included). Use when the user
  mentions PDF, pages, extract text/tables, merge/reorder pages, PDF forms,
  watermarks, or PDF metadata.
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

- sk-docx/sk-xlsx for source formats; sk-ocr-pro for dense/scanned OCR; sk-docs for content interpretation.

## Library and tool guide

- **pypdf** — merge, split, rotate, encrypt/decrypt, metadata.
- **pdfplumber** — text and table extraction (extract_text / extract_tables).
- **reportlab** — create PDFs (Canvas or Platypus). NEVER use Unicode sub/superscript glyphs in ReportLab fonts (renders as black boxes); use `<sub>` / `<super>` markup in Paragraph instead.
- **pdf2image + pytesseract** — OCR scanned PDFs (convert pages to images first).
- **pdfimages / pdftotext / qpdf / pdftk** — CLI extraction, merge/split/rotate, decrypt.
- **Form filling** — follow `references/forms.md`: check fillable fields first, extract field info JSON, fill via JS scripts in `scripts/` (check-fillable-fields, extract-form-field-info, fill-fillable-fields, fill-pdf-form-with-annotations, check-bounding-boxes, convert-pdf-to-images, create-validation-image).
- **Advanced** — pypdfium2 rendering and JS libraries (pdf-lib): see `references/advanced-reference.md`.

### Common recipes

| Task | Best tool | Hint |
|------|-----------|------|
| Merge PDFs | pypdf / qpdf | `writer.add_page(page)` or `qpdf --empty --pages a.pdf b.pdf -- out.pdf` |
| Split PDFs | pypdf / qpdf | One page per file; `qpdf in.pdf --pages . 1-5 -- out.pdf` |
| Extract text | pdfplumber / pdftotext | `page.extract_text()`; `pdftotext -layout` preserves layout |
| Extract tables | pdfplumber | `page.extract_tables()` → pandas |
| Create PDFs | reportlab | Canvas or Platypus |
| Watermark | pypdf | `page.merge_page(watermark)` |
| Encrypt | pypdf | `writer.encrypt(user, owner)` |
| OCR scanned | pytesseract | pdf2image → `image_to_string` |
| Fill forms | pdf-lib / pypdf | see `references/forms.md` |
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.

## Example

Merge and extract text from a PDF with the canonical tools:

```bash
# Merge with qpdf (pypdf equivalent: writer.add_page)
qpdf --empty --pages cover.pdf report.pdf -- merged.pdf
# Layout-preserving text extraction for downstream analysis
pdftotext -layout merged.pdf out.txt
# Scanned pages need OCR: render to image first, then tesseract
pdftoppm -png -r 300 scan.pdf page && tesseract page-1.png out -l eng
```
