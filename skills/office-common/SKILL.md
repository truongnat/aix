---
name: office-common
description: Shared Python helpers for office document skills. Use when working with the bundled XLSX, DOCX, PPTX, or PDF helper modules and their validation/publish utilities.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# Office Common

Use the bundled  package as shared implementation support for the office skills in this repository.

## Available helpers

- Coverage manifests and validation errors
- Semantic fingerprints
- Atomic publish (temporary output, validate, then replace)
- OOXML ZIP inventory helpers
- Optional tool detection for LibreOffice, Tesseract, and Poppler

Import from the package rather than duplicating these helpers in an individual office skill.

## Output

Produce a document/media artifact with input and output paths, coverage/quality checks, unsupported-content limitations, validation evidence, and delivery notes.

## Boundary

**`sk-office-common`** owns **shared office-document conventions, inspection boundaries, and artifact handoffs across DOCX/XLSX/PDF/PPTX**. It does not own **format-specific implementation as the primary concern or unsupported lossless guarantees**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-office-common`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- source format, operation, supported feature set, preservation requirements, output format, and validation evidence.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-docx/sk-xlsx/sk-pdf/sk-pptx for format-specific work; sk-technical-writing-pro for content quality; sk-docs for information architecture.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
