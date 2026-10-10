# DOCX Coverage (v1)

## Contract

Supported-lossless with `coverage_ratio == 1.0` required before publish.

## Supported

- Paragraphs (text + style name)
- Tables and cell text
- Headers/footers/media/theme package parts in declared prefixes
- Core properties (title, author, subject)

## Unsupported (block)

- VBA / macros, OLE, ActiveX
- Digital signatures
- Legacy `.doc`
- Tracked-change preservation as a first-class edit API (inventory may still pass if parts are in supported set)

Note: standard `customXml/` package parts emitted by python-docx are in the
supported subset.

## CLI

```bash
python `scripts/cli.py` inspect file.sk-docx
python `scripts/cli.py` create spec.json out.sk-docx
python `scripts/cli.py` edit in.sk-docx edits.json out.sk-docx
python `scripts/cli.py` validate file.sk-docx
```
