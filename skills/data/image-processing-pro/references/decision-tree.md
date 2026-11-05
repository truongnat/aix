# Image processing — decision tree

## Library

- **Raster edit, thumbnails, EXIF** → Pillow (this skill’s default).
- **ML vision** → Dedicated ML stack — not Pillow-only scope.

## Color and mode

- **RGBA vs RGB** — alpha for overlays; flatten for JPEG output.

## Memory

- **Huge images** → tile/stream; avoid loading full decode when possible.

## Output format quick pick

```
Need transparency?
├── Yes → PNG or WebP (lossless or lossy with alpha)
└── No → JPEG for photos; WebP if clients support — **`decision-framework-and-trade-offs.md`**
```
