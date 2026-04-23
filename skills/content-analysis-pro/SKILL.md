---
name: content-analysis-pro
description: |
  Production-grade multimodal content analysis: explicit analysis pipeline (modality → decode → segment → extract → verify → report), evidence and provenance rules (page, time, region anchors), grounded vs inferred claims, failure modes (OCR error, sampling gaps, chart number invention, deepfakes, token limits, locked files), decision trade-offs (summary vs extract vs compare, full read vs stratified sample, human-in-the-loop for high-stakes), quality and anti-hallucination guardrails, structured reports with limitations and confidence — for documents, images, video, and audio. Not a replacement for legal, medical, or forensic experts.

  Use when the user supplies or points to content to summarize, extract, compare, or audit with traceable evidence. Combine with business-analysis-pro for BRD-style outputs, security-pro for PII/secrets, data-analysis-pro for tabular math on extracted data, web-research-pro for external fact-check, image-processing-pro for raster prep, testing-pro for extraction-regression tests.

  Triggers: "analyze this image", "analyze video", "analyze PDF", "summarize attachment", "OCR", "transcript", "screenshot", "extract from doc", "compare these files", "timeline", "evidence map", "provenance", "grounding", "hallucination", "illegible", "frame at timestamp", "password protected PDF", "deepfake", "sampling strategy", "entity extraction", "redact", "multimodal", "chart in image", "quote with page number".

metadata:
  short-description: Content analysis — pipeline, evidence, failure modes, grounding, reports
  content-language: en
  domain: content-analysis
  level: professional
---

# Content analysis (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use this skill when **source material** (files, pasted text, described media) must be read **carefully** and returned as **structured intelligence** with **traceable evidence** — not casual chat. This skill encodes a **pipeline system model** (`analysis-pipeline-system-model.md`), **failure modes**, **decision trade-offs** for coverage vs cost, and **grounding guardrails**. **Optional tooling** (FFmpeg, OCR APIs) implements stages — **`analysis-methods-and-frames.md`** — the skill governs **what** is asserted and **how** limitations are disclosed. Confirm **user goal**, **output format**, and **sensitivity** (PII, confidential).

## Boundary

**`content-analysis-pro`** owns **reading, structuring, synthesizing**, and **evidence-linked reporting** on provided content across modalities. **`business-analysis-pro`** owns **business requirements packaging** from findings. **`data-analysis-pro`** owns **quantitative analysis** of tabular **data** (statistics, pivots), typically **after** clean extraction. **`security-pro`** owns **handling policies** for secrets seen in screenshots. **`image-processing-pro`** owns **pixel transforms** — not semantic interpretation alone.

## Related skills (this repo)

| Skill | When to combine with `content-analysis-pro` |
|-------|---------------------------------------------|
| **`business-analysis-pro`** | Turn extracted facts into requirements, BRD, decisions |
| **`security-pro`** | Redaction, credentials/sensitive handling |
| **`data-analysis-pro`** | CSV/Parquet numeric work on **structured** extracts |
| **`web-research-pro`** | External verification of claims not in corpus |
| **`image-processing-pro`** | Raster prep before vision read |
| **`testing-pro`** | Golden tests for automated extraction pipelines |
| **`repo-tooling-pro`** | Shared scripts for repeatable FFmpeg/OCR |
| **`seo-pro`** | Rare — web/marketing asset angle |

## When to use

- Documents, images, video (or paste) requiring **detail**, extraction, comparison, or timeline.
- **Formal-style** reports with sections, citations (page/time), confidence.
- Explicit **limitations** and **uncertainty** when media is ambiguous.

## When not to use

- **Pure tabular analytics** without narrative source reading — **`data-analysis-pro`** may lead if data already clean CSV.
- **Choosing business priorities** without document — **`business-analysis-pro`**.

## Required inputs

- **Goal** (summarize / extract / compare / compliance scan), **modalities**, **constraints** (length, language, redaction).

## Expected output

Follow **Suggested response format** strictly — pipeline through residual risks — with **evidence anchors** unless user explicitly waived (then state waiver).

## Workflow

1. Confirm goal, modality, sensitivity, and required **evidence granularity** (audit vs informal).
2. Apply summaries; open `references/`; enforce **grounding** — **`quality-validation-and-guardrails.md`**.
3. Respond using **Suggested response format**; delegate BRD packaging to **`business-analysis-pro`** when appropriate.

### Operating principles

1. **Ground in the source** — Cite page, timestamp, or visible region; separate **quote** from **interpretation** — **`evidence-and-provenance-rules.md`**.
2. **No fabricated facts** — Unclear → say so; **inference** labeled — **`failure-modes-detection-mitigation.md`**.
3. **Structured output** — Headings, bullets, tables; executive + detail when useful — **`reporting-and-limitations.md`**.
4. **Modality-aware** — Scanned PDF, charts, video sampling — **`analysis-methods-and-frames.md`**.
5. **Safety and privacy** — Minimize secret reproduction — **`security-pro`**.
6. **Human-in-the-loop** for **high-stakes** domains — assist only — **`reporting-and-limitations.md`**.

### Analysis pipeline — system model (summary)

Stages from input to evidence-backed report — **`analysis-pipeline-system-model.md`**.

Details: [references/analysis-pipeline-system-model.md](references/analysis-pipeline-system-model.md)

### Failure modes — detection and mitigation (summary)

OCR, sampling gaps, hallucinated labels, DRM lock — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Coverage vs depth; human review domains — **`decision-framework-and-tradeoffs.md`**.

Details: [references/decision-framework-and-tradeoffs.md](references/decision-framework-and-tradeoffs.md)

### Evidence and provenance rules (summary)

Anchors per modality; quote discipline — **`evidence-and-provenance-rules.md`**.

Details: [references/evidence-and-provenance-rules.md](references/evidence-and-provenance-rules.md)

### Quality validation and grounding guardrails (summary)

Anti-hallucination checklist — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Analysis methods and frames (summary)

Per-modality angles; video paths — **`analysis-methods-and-frames.md`**.

Details: [references/analysis-methods-and-frames.md](references/analysis-methods-and-frames.md)

### Reporting and limitations (summary)

Report sections, fidelity, confidence — **`reporting-and-limitations.md`**.

Details: [references/reporting-and-limitations.md](references/reporting-and-limitations.md)

### Tips and tricks (summary)

Goal-first, sampling, scans — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

DRM, tables, RTL, litigation sampling — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Scope and file-format dispatch (summary)

Routing formats — **`file-formats-dispatch-and-scope.md`**.

Details: [references/file-formats-dispatch-and-scope.md](references/file-formats-dispatch-and-scope.md)

### Decision trees (summary)

Input type, goal, scale, risk — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

No sampling frame, OCR blindness — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`business-analysis-pro`**, **`security-pro`**, **`data-analysis-pro`**, **`web-research-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and tooling (summary)

Tool/docs drift — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — What was supplied (modalities, count, language hints), user goal, sensitivity level.
2. **Problem** — Deliverable shape (summary vs extraction schema vs comparison) and success criteria.
3. **System design / architecture** — Pipeline sketch: modalities → segmentation/extraction → synthesis; **grounding rule** for this run — **`analysis-pipeline-system-model.md`**.
4. **Decision reasoning** — Coverage strategy (full vs sample), frames (entities/timeline), handoff to **`business-analysis-pro`** / **`data-analysis-pro`** if needed — **`decision-framework-and-tradeoffs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Report outline, extraction table schema, or section list — **structured body** (label **Code** if using a fixed template block).
6. **Trade-offs** — Depth vs token/time; automation vs manual verify; multilingual risk.
7. **Failure modes** — What could mislead (OCR, missed scene, illegible chart) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Uncertainty pockets, need for human expert, **`security-pro`** if secrets surfaced.

## Resources in this skill

| Topic | File |
|-------|------|
| Analysis pipeline (system model) | [references/analysis-pipeline-system-model.md](references/analysis-pipeline-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-tradeoffs.md](references/decision-framework-and-tradeoffs.md) |
| Evidence & provenance rules | [references/evidence-and-provenance-rules.md](references/evidence-and-provenance-rules.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Methods & frames | [references/analysis-methods-and-frames.md](references/analysis-methods-and-frames.md) |
| Reporting & limitations | [references/reporting-and-limitations.md](references/reporting-and-limitations.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Scope & format dispatch | [references/file-formats-dispatch-and-scope.md](references/file-formats-dispatch-and-scope.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions & tooling | [references/versions.md](references/versions.md) |

## Quick examples

**Input:** Dashboard screenshot — “Is revenue growing?”  
**Expected output:** Chart read from **visible** axes; **confidence**; no invented numbers; **failure modes** if unreadable.

**Input:** Password PDF — extract vendors.  
**Expected output:** Cannot without unlock; **no** guessed content; **`security-pro`**-safe path.

**Input:** Webinar → acceptance criteria.  
**Expected output:** This skill: timestamped summary; **`business-analysis-pro`**: AC; **demo ≠ contract** risk in residual.

## Checklist before calling the skill done

### Grounding

- [ ] Findings **tied** to evidence (page/time/region) where applicable — **`evidence-and-provenance-rules.md`**.
- [ ] **Inference** labeled; **gaps** explicit — **`quality-validation-and-guardrails.md`**.
- [ ] **No fabricated** quotes, numbers, or UI labels.

### Process & handoffs

- [ ] **Goal** and **output shape** matched; **modality** checks (scan, video sample) applied.
- [ ] **PII/sensitive** handling — **`security-pro`** when needed.
- [ ] **Business packaging** delegated to **`business-analysis-pro`** when task is requirements-from-content, not summary-only.

### Robustness

- [ ] **Failure modes** section addressed — **`failure-modes-detection-mitigation.md`** themes.
- [ ] **Limitations** and **confidence** stated — **`reporting-and-limitations.md`**.
