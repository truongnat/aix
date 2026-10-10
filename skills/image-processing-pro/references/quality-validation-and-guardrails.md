# Quality validation and guardrails (anti-hallucination)

## APIs and versions

- [ ] **Pillow majors** rename/move APIs occasionally — cite **“check Pillow X.Y docs”** for exotic ops — **`versions.md`**.
- [ ] **HEIF/HEIC** support depends on **optional** codecs and wheels — don’t assume `open()` works everywhere — **`edge-cases.md`**.

## Scripts

- [ ] **Paths** in examples — use placeholders (`input_dir`, `path/to/file.jpg`) unless user gave real paths.
- [ ] Never suggest **destructive** batch overwrite without `--dry-run` / backup callout — **`failure-modes-detection-mitigation.md`**.

## Semantic claims

- [ ] Do **not** infer **objects/text in image** — route to **`content-analysis-pro`** / OCR stack — **`integration-map.md`**.

## Numerics

- [ ] **Quality** values (`quality=85`) are **JPEG/WebP** parameters — not interchangeable semantics across formats — document per `save()` kwargs.
