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