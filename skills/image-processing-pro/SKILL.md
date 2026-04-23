---
name: image-processing-pro
description: |
  Production-grade raster image processing with Pillow (PIL): open/save, resize, crop, rotate, format conversion (JPEG, PNG, WebP), compositing, thumbnails, EXIF orientation, batch workflows — plus pixel pipeline model (decode → mode → encode), failure modes (decompression bomb, EXIF leak, CMYK drift, overwrite, alpha→JPEG), decision trade-offs (lossy vs lossless, Pillow vs CLI/libvips), quality guardrails (no semantic “what’s in the image”; version-accurate APIs).

  Use this skill for **pixel-level** operations — not **semantic** description (“what is in this screenshot?”). For **meaning**, **OCR**, or **chart reading**, use **`content-analysis-pro`**.

  Combine with **`content-analysis-pro`** when extracting then interpreting; **`security-pro`** for EXIF/strip/redaction; **`testing-pro`** for golden outputs; **`docker-pro`** for codec deps in CI.

  Triggers: "Pillow", "PIL", "resize image", "crop", "convert to PNG", "WebP", "thumbnail", "composite", "alpha", "EXIF", "rotate image", "batch images", "strip metadata", "LANCZOS", "RGBA to JPEG", "ImageOps.exif_transpose", "decompression bomb", "watermark", "ICO", "HEIC".

metadata:
  short-description: Image processing — Pillow pipeline, transforms, formats, failure modes, batch safety
  content-language: en
  domain: imaging
  level: professional
---

# Image processing (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **[Pillow](https://pillow.readthedocs.io/)** for API truth; this skill encodes **safe defaults** for **resize**, **format**, **metadata**, and **batch** hygiene.

## Boundary

**`image-processing-pro`** owns **raster transforms** (geometry, codecs, compositing). **`content-analysis-pro`** owns **semantic** interpretation. **`security-pro`** owns **policy** for sensitive pixels and metadata beyond strip flags.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`content-analysis-pro`** | Meaning, OCR, charts as **content** |
| **`security-pro`** | EXIF/GPS, redaction, untrusted uploads |
| **`data-analysis-pro`** | Chart **data**; use **this** skill for exporting raster figures |
| **`deployment-pro`** | Asset CI/CD, CDN |
| **`testing-pro`** | Snapshot/golden image tests |
| **`docker-pro`** | Imagemagick/font/codec stack in images |
| **`web-research-pro`** | Stock image licensing |

## When to use

- Resize, crop, rotate, thumbnail for web or limits.
- Convert formats and modes (`RGB`, `RGBA`, `CMYK` handling).
- Composite watermarks; batch folders.
- EXIF transpose; metadata strip policy.

## When not to use

- **“What does this image show?”** — **`content-analysis-pro`** (or vision stack).
- **Vector** (SVG) authoring — vector tools / other skills.

## Required inputs

- **Input** color mode / source (camera, screenshot, generated).
- **Output** constraints (max px, format, alpha yes/no).
- **Metadata** keep vs strip for publishing.

## Expected output

Follow **Suggested response format** strictly.

## Workflow

1. Confirm paths, output spec, metadata policy.
2. Apply summaries; open `references/`; route **meaning** questions away from this skill.
3. Respond with **Suggested response format**; include **failure modes** for untrusted or huge inputs.

### Operating principles

1. **Non-destructive batching** — Separate output dir — **`image-pipeline-and-pixel-model.md`**.
2. **Explicit modes** — JPEG vs alpha — **`pillow-operations.md`**.
3. **Metadata** — Strip GPS/identifiers when publishing — **`security-pro`**.
4. **Resampling** — Quality downscale (`LANCZOS` when available) — **`tips-and-tricks.md`**.
5. **No vision by resize** — Semantics elsewhere — **`integration-map.md`**.
6. **Reproducibility** — Fixed dimensions for downstream ML/tests — **`quality-validation-and-guardrails.md`**.

### Image pipeline and pixel model (summary)

Decode → mode → encode; memory scales with pixels — **`image-pipeline-and-pixel-model.md`**.

Details: [references/image-pipeline-and-pixel-model.md](references/image-pipeline-and-pixel-model.md)

### Failure modes — detection and mitigation (summary)

Bombs, EXIF leaks, overwrite, CMYK, animation frames — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Lossy vs lossless; Pillow vs CLI/libvips; metadata policy — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No fake paths; no semantic claims; Pillow/codec caveats — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Pillow operations (summary)

Resize, crop, thumbnail, rotate, save, composite, EXIF — **`pillow-operations.md`**.

Details: [references/pillow-operations.md](references/pillow-operations.md)

### Tips and tricks (summary)

In-place ops, sRGB, batch naming — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

CMYK, huge rasters, animation, orientation, HEIF — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Library choice, format, memory — **`decision-tree.md`** · **`anti-patterns.md`**.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`content-analysis-pro`**, **`security-pro`**, **`testing-pro`**, **`deployment-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Pillow majors, codec wheels — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Input source, size trust (user files vs internet), output spec, metadata policy.
2. **Problem / goal** — Transform needed (explicitly **not** “describe image” unless routed).
3. **System design** — Pipeline step: orientation → mode → geometry → encode — **`image-pipeline-and-pixel-model.md`**.
4. **Decision reasoning** — Format/resample/thumbnail strategy — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Pillow snippets; safe `MAX_IMAGE_PIXELS` for untrusted — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Quality vs size; ICC strip vs fidelity; batch speed vs memory.
7. **Failure modes** — Relevant risks — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untrusted inputs; handoff **`content-analysis-pro`** / **`security-pro`** / **`docker-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Pipeline & pixel model** | [references/image-pipeline-and-pixel-model.md](references/image-pipeline-and-pixel-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Pillow operations | [references/pillow-operations.md](references/pillow-operations.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Resize PNGs in `./in` to max width 1200px, JPEG 85% to `./out`.  
**Expected output:** Full **Suggested response format** — `thumbnail`/resize, `RGB` for JPEG, alpha warning; **failure modes** overwrite/exif.

### 2 — Tricky (edge case)

**Input:** Phone photos wrong rotation on web.  
**Expected output:** `ImageOps.exif_transpose` **before** resize — **`edge-cases.md`**; strip policy → **`security-pro`**.

### 3 — Cross-skill

**Input:** MP4 key frames then blur faces for blog.  
**Expected output:** FFmpeg extract (tooling) + **this skill** blur — face **detection** not Pillow-only → **`content-analysis-pro`** / CV; **`security-pro`** policy.

## Checklist before calling the skill done

### Skill routing

- [ ] **Transform** vs **interpretation** — **`content-analysis-pro`** if meaning required.

### Safety & quality

- [ ] **Metadata** policy for sharing — **`security-pro`** when sensitive.
- [ ] **Outputs** never silent overwrite sources — **`failure-modes-detection-mitigation.md`**.
- [ ] **Mode** (`RGB`/`RGBA`) and **format** constraints explicit — **`pillow-operations.md`**.
- [ ] **MAX_IMAGE_PIXELS** / trust path for untrusted inputs — **`edge-cases.md`**.
- [ ] **Resampling** stated — **`tips-and-tricks.md`**.
- [ ] **Reproducible** batch naming/paths — **`anti-patterns.md`**.
- [ ] **Failure modes** section present for bombs or uploads — **`failure-modes-detection-mitigation.md`**.
