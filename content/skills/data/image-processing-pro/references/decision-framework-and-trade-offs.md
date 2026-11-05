# Decision framework and trade-offs

## Pillow-centric vs other tools

| Tool class | Fits when |
|------------|-----------|
| **Pillow** | Thumbnails, crop, overlay, batch rename, EXIF strip — **default for this skill** |
| **CLI (ImageMagick, ffmpeg)** | Heavy video frames, exotic codecs — shell outside Python |
| **Native libs (libvips via pyvips)** | Very large tiled images; streaming — when Pillow memory limits bite |

## Lossy vs lossless output

| Choice | Trade-off |
|--------|-----------|
| **JPEG** | Small; **lossy**; no alpha |
| **PNG** | Lossless; larger; alpha OK |
| **WebP** | Often best size/quality; verify decoder support in targets — **`versions.md`** |

## Thumbnail strategies

| Strategy | Notes |
|----------|-------|
| **`thumbnail()` in place** | Mutates image — copy first if keeping original object |
| **Resize to exact box** | Letterbox vs crop — product decision |

## Metadata

| Policy | When |
|--------|------|
| **Strip all** | Public uploads — privacy — **`security-pro`** |
| **Preserve copyright ICC** | Print/repro workflows — document exception |
