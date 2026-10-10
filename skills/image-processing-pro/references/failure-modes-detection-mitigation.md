# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Decompression bomb** | Tiny file → huge bitmap | RAM spike / OOM | `Image.MAX_IMAGE_PIXELS`; reject or downsample early — **`anti-patterns.md`** |
| **EXIF leak** | GPS/device in upload | Inspection tools | `getexif()` strip before publish — **`security-pro`** |
| **Wrong rotation** | Ignored orientation | Sideways thumbnails | `ImageOps.exif_transpose` first — **`edge-cases.md`** |
| **Silent overwrite** | Same path in/out | Lost originals | Separate dirs; `--dry-run` pattern — **`anti-patterns.md`** |
| **Alpha → JPEG loss** | `RGBA.save("*.jpg")` | Flat background surprise | Explicit `convert("RGB")` + matte — **`pillow-operations.md`** |
| **CMYK → web shift** | Browser expects RGB | Washed/out colors | `convert("RGB")` with profile awareness — **`edge-cases.md`** |
| **Animated GIF/WebP** | Only first frame processed | Missing motion | Iterate frames or reject multi-frame — **`edge-cases.md`** |
| **Upscale blur** | Nearest/bilinear default | Soft blocks | Resampling choice (`LANCZOS` down) — **`tips-and-tricks.md`** |
| **ICC stripped** | “Optimize” saves | Color drift cross-displays | Policy: embed or convert to sRGB — **`decision-framework-and-trade-offs.md`** |
