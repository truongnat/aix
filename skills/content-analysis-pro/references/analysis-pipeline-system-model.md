# Analysis pipeline — system model

Treat multimodal analysis as a **pipeline** with explicit **grounding points** — not a single black box.

## Stages

```text
Inputs (files, paste, URLs-as-text)
    → modality & format identification
    → decode / access (unlock? DRM? codec?)
    → segment (pages, scenes, regions, tables)
    → extract (OCR, ASR, layout parse, chart read)
    → verify (cross-check headings vs body, spot samples)
    → synthesize (summary, comparison, timeline)
    → report with evidence map
```

## Grounding vs inference

| Layer | Rule |
|-------|------|
| **Grounded** | Directly tied to visible text, audio transcript line, or described pixel region — cite **page / time / crop**. |
| **Inference** | Must be labeled (“likely”, “appears to”) with **reason** — never presented as verbatim fact. |

## State and reproducibility

- **Same file + same instructions** should yield **same quotes** (modulo tool versions) — document tool/version when automation matters — **`versions.md`**.
- **Sampling** (video frames) introduces **coverage gaps** — declare **sample rule** in report — **`reporting-and-limitations.md`**.

## Outputs as artifacts

Structured deliverables (**tables**, **entity lists**) are **derived views** — trace back to evidence rows — **`reporting-and-limitations.md`**.
