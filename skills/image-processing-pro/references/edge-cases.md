# Edge cases

- **CMYK** vs **RGB** — convert explicitly for web; JPEG from CMYK can surprise.
- **Huge** images — **downsample** before ML or vision APIs; watch memory.
- **Animated GIF/WebP** — Pillow can iterate frames; not all ops apply to every frame uniformly without extra code.
- **EXIF orientation** — `ImageOps.exif_transpose` when photos appear rotated.

## Decompression bombs

- Malicious **small files** expanding to gigantic bitmaps — set **`Image.MAX_IMAGE_PIXELS`** (or vendor equivalent) and validate before decode — **`failure-modes-detection-mitigation.md`**.

## HEIF / HEIC / AVIF

- Availability depends on **Pillow build** and **plugins** — may fail at `open()` on minimal installs; document dependency or convert upstream — **`quality-validation-and-guardrails.md`**.
