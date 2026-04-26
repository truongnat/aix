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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** paths, output spec, metadata policy. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm source type, output constraints, alpha/metadata requirements, and overwrite risk before changing pixels. Ask when publishing or archival intent is unclear.
2. **Simplicity First** — Use the smallest raster transform chain that solves the problem. Do not add compositing, batch tooling, or extra format hops without need.
3. **Surgical Changes** — Touch only the requested image operations and outputs. Do not reinterpret the image semantically or alter unrelated assets.
4. **Goal-Driven Execution** — Done = the output image meets the size/format/metadata spec and can be verified visually or by properties.
5. **Pixels, not semantics** — This skill changes raster data; it does not infer meaning from the image.
6. **Format choices are trade-offs** — Alpha, compression, color mode, and EXIF handling materially affect fidelity and output usability.
7. **Metadata is part of the payload** — EXIF/GPS retention or stripping should be explicit, not accidental.
8. **Batch safety matters** — File naming, overwrite behavior, and decompression-bomb limits should be considered before mass transforms.

## Default recommendations by scenario

- **Simple publish resize** — Start with EXIF-aware transpose, resize, and the target format only.
- **Alpha-preserving output** — Stay in PNG/WebP and avoid accidental JPEG flattening.
- **Metadata-sensitive asset** — Explicitly strip or retain metadata before export.
- **Batch workflow** — Dry-run naming and output folder choices before writing many files.

## Decision trees

Summary: choose transform sequence and output format based on alpha, fidelity, metadata, and batch-safety requirements.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: silent metadata leaks, flattening alpha into JPEG by accident, repeated re-encoding damage, and treating raster transforms like semantic analysis.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Image pipeline and pixel model (summary)

How decode, mode conversion, geometry changes, and encode steps interact so raster outputs stay predictable.

Details: [references/image-pipeline-and-pixel-model.md](references/image-pipeline-and-pixel-model.md)

### Pillow operations (summary)

How to use Pillow for resize, crop, rotate, format conversion, and compositing with safe defaults.

Details: [references/pillow-operations.md](references/pillow-operations.md)

### Failure modes and mitigation (summary)

EXIF leaks, decompression bombs, CMYK drift, alpha loss, and overwrite mistakes to catch before output is trusted.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect Pillow APIs, codec support, and safe operation assumptions.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Source type, output constraints, metadata policy, and batch/single-file scope.
2. **Pixel model** — Explain the relevant mode/format/transform behavior.
3. **Solution** — Minimum image-processing steps with rationale.
4. **Verification** — How to confirm dimensions, format, metadata, and visual result.
5. **Residual risks** — Remaining fidelity, metadata, or batch-safety caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Image pipeline and pixel model | [references/image-pipeline-and-pixel-model.md](references/image-pipeline-and-pixel-model.md) |
| Pillow operations | [references/pillow-operations.md](references/pillow-operations.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Resize these screenshots for the web and strip metadata."
- Apply EXIF-aware orientation, resize once, and save in the target format.
- Keep metadata policy explicit instead of relying on defaults.
- **Verify:** Output dimensions and metadata state match the publish spec.

**Input (tricky):** "Convert an RGBA asset to JPEG and keep transparency."
- Call out that JPEG cannot preserve alpha.
- Choose a flattened background or a different target format deliberately.
- **Verify:** The result matches the chosen transparency strategy rather than silently degrading.

**Input (cross-skill):** "Prepare images, then OCR them."
- Pair **`image-processing-pro`** for pixel cleanup and **`content-analysis-pro`** or **`ocr-pro`** for reading.
- Keep transform and interpretation responsibilities separate.
- **Verify:** The processed images are cleaner and the downstream reader receives the intended inputs.

## Checklist before calling the skill done

- [ ] Source, output spec, and metadata policy confirmed first (Think Before Coding)
- [ ] Minimum transform chain chosen; no unnecessary raster churn (Simplicity First)
- [ ] Only the requested assets/operations were changed (Surgical Changes)
- [ ] Success criteria and output verification are explicit (Goal-Driven Execution)
- [ ] Format/mode trade-offs are acknowledged where relevant
- [ ] Metadata handling is intentional
- [ ] Batch overwrite and path safety are considered where relevant
- [ ] Residual fidelity or codec caveats are documented
