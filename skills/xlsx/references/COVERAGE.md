# XLSX Coverage (v1)

## Contract

Supported-lossless: every detected data item in the v1 subset must be
`preserved` or intentionally `transformed`. `coverage_ratio` must be `1.0`
before publish. Unsupported items **block** writes.

## Supported

- Workbook sheets, cell values, formulas (as stored strings), number formats
- Merged ranges
- Shared strings, styles, theme package parts used by openpyxl
- Core document properties (title, creator, subject)
- Charts/drawings package parts when present as standard OOXML (inventory)

## Unsupported (block)

- VBA / macros (`vbaProject.bin`)
- OLE / ActiveX embeddings
- Digital signatures
- Custom XML parts outside declared prefixes
- Encrypted workbooks
- Legacy `.xls`

## Optional tools

- LibreOffice: formula recalculation check (skipped if absent; never false-pass)

## CLI

```bash
`skills/sk-xlsx/.venv/bin/python `scripts/cli.py` inspect file.sk-xlsx --manifest out.json
`skills/sk-xlsx/.venv/bin/python `scripts/cli.py` create spec.json out.sk-xlsx --manifest out.json
`skills/sk-xlsx/.venv/bin/python `scripts/cli.py` edit in.sk-xlsx edits.json out.sk-xlsx
`skills/sk-xlsx/.venv/bin/python `scripts/cli.py` validate file.sk-xlsx
```
