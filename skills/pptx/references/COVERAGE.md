# PPTX Coverage (v1)

## Contract

Supported-lossless with `coverage_ratio == 1.0` required before publish.

## Supported

- Slides and shape text
- Standard slide layouts/masters/theme/media package parts
- Notes slides and charts package parts in declared prefixes

## Unsupported (block)

- VBA / macros, OLE, ActiveX
- Digital signatures
- Custom XML outside declared prefixes
- Legacy `.ppt`
- Pixel-perfect visual QA (optional Poppler/LibreOffice checks are skipped if absent)

## CLI

```bash
python `scripts/cli.py` inspect file.sk-pptx
python `scripts/cli.py` create spec.json out.sk-pptx
python `scripts/cli.py` edit in.sk-pptx edits.json out.sk-pptx
python `scripts/cli.py` validate file.sk-pptx
```
