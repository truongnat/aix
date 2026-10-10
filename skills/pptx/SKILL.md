---
name: pptx
description: >-
  Create, inspect, edit, and validate PowerPoint .sk-pptx files with strict
  supported-lossless coverage manifests (Python/python-pptx). Use when the user
  mentions PowerPoint, .sk-pptx, slides, or decks.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# PPTX

## Purpose

Work with modern PowerPoint `.sk-pptx` files using the Python CLI under a
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
| Inputs | .sk-pptx path and/or JSON create/edit spec; optional manifest path. |
| Outputs | .sk-pptx deliverable for create/edit plus coverage manifest JSON with coverage_ratio=1.0. |
| Safety | Do NOT publish when unsupported OOXML parts/macros/OLE/signatures exist. Do NOT claim pixel-perfect fidelity without optional tool checks. Do NOT silently drop slides/shapes. |

### Required artifacts

#### `coverage.json`
- Required: yes
- **format** (required, string): Must be sk-pptx.
- **operation** (required, string): inspect | create | edit | validate
- **coverage_ratio** (required, number): Must equal 1.0 before publish.
- **items** (required, array): Coverage inventory entries.

Use `references/golden-output-and-slide-evidence.md` to verify narrative order, rendered layout, content, theme, export behavior, unsupported features, and the publish coverage gate.

### Reference

## Runtime




## Output

Produce a document/media artifact with input and output paths, coverage/quality checks, unsupported-content limitations, validation evidence, and delivery notes.

## Boundary

**`sk-pptx`** owns **supported presentation artifact inspection, creation, editing, and validation with explicit content/layout limitations**. It does not own **presentation strategy, unsupported PowerPoint features, or broad visual design outside slide artifacts**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-pptx`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- PPTX path or slide brief, audience, slide limit, content outline, supported feature set, and verification target.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-slides/design skills for narrative and visual direction; sk-office-common for shared conventions; sk-pdf for export/inspection; sk-docs for source content.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
