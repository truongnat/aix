---
name: docx
description: >-
  Create, inspect, edit, and validate Word .docx files with strict
  supported-lossless coverage manifests (Python/python-docx). Use when the user
  mentions Word, .docx, document paragraphs, or tables.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# DOCX

## Purpose

Work with modern Word `.docx` files using the Python CLI under a
supported-lossless coverage contract.

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
| Inputs | .docx path and/or JSON create/edit spec; optional manifest path. |
| Outputs | .docx deliverable for create/edit plus coverage manifest JSON with coverage_ratio=1.0. |
| Safety | Do NOT publish when unsupported OOXML parts/macros/OLE/signatures exist. Do NOT claim legacy .doc support. Do NOT silently drop paragraphs/tables. |

### Required artifacts

#### `coverage.json`
- Required: yes
- **format** (required, string): Must be sk-docx.
- **operation** (required, string): inspect | create | edit | validate
- **coverage_ratio** (required, number): Must equal 1.0 before publish.
- **items** (required, array): Coverage inventory entries.

Use `references/golden-output-and-pagination.md` to verify text structure, pagination, tables/media, metadata, round-trip behavior, unsupported content, and the publish coverage gate.

### Reference

## Runtime




## Output

Produce a document/media artifact with input and output paths, coverage/quality checks, unsupported-content limitations, validation evidence, and delivery notes.

## Boundary

**`sk-docx`** owns **supported-lossless Word DOCX inspection, creation, editing, and coverage validation**. It does not own **legacy .doc, unsupported OOXML/macros/OLE, or general document strategy**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-docx`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- DOCX path or create/edit specification, supported-content inventory, operation, output target, and coverage requirements.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-docs or sk-technical-writing-pro for content/structure; sk-office-common for shared office conventions; sk-pdf for conversion only after DOCX validation.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
