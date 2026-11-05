# Image pipeline and pixel model

## Decode → transform → encode

```text
Encoded bytes → decode to raster → mode / color interpretation → geometric ops → encode + metadata
```

- **Pixels live in memory** proportional to width × height × bands — **`failure-modes-detection-mitigation.md`** for huge inputs.

## Mode vs format

| Concept | Meaning |
|---------|---------|
| **Mode** (`L`, `RGB`, `RGBA`, `CMYK`, …) | How Pillow represents samples **in memory** |
| **Format** (JPEG, PNG, WebP) | **Container/codec** on disk — limits alpha, bit depth — **`pillow-operations.md`** |

**JPEG cannot store alpha** — flatten or use PNG/WebP — **`edge-cases.md`**.

## Orientation and color

- **EXIF orientation** — Logical rotation **before** geometric resize for consistent dimensions — **`edge-cases.md`**.
- **ICC / embedded profiles** — Web often assumes **sRGB**; mismatches cause “wrong colors” — convert explicitly when publishing — **`tips-and-tricks.md`**.

## Batch discipline

- **Deterministic order** — Sort paths; separate **input/** and **output/** roots — **`anti-patterns.md`**.
