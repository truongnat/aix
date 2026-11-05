# Image processing — anti-patterns

## Ignoring EXIF orientation

- Rotated photos wrong in UI.
- **Fix:** `ImageOps.exif_transpose` or explicit orientation handling.

## JPEG round-trip quality loss

- Repeated save degrades.
- **Fix:** Work in lossless intermediate; single final JPEG encode.

## No bounds on resize

- Decompression bomb / memory exhaustion.
- **Fix:** Max pixel count; stream verify.

## sRGB assumption

- Print/wide-gamut surprises.
- **Fix:** Document color profile handling.
