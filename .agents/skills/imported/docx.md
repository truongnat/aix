# Skill: docx
Schema: antigrav.skill@v1

```json
{
  "description": "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce ",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153430,
  "model": "qwen3:8b",
  "name": "docx",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "docx/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/anthropic-skills",
  "tags": [
    "anthropic",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.

## When to Use
- Use when the task matches this skill domain.

## Examples
- python scripts/office/soffice.py --headless --convert-to docx document.doc
- # Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
- python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page

## Limitations
- **Replace entire `<w:r>` elements**: When adding tracked changes, replace the whole `<w:r>...</w:r>` block with `<w:del>...<w:ins>...` as siblings. Don't inject tracked change tags inside a run.
- **Preserve `<w:rPr>` formatting**: Copy the original run's `<w:rPr>` block into your tracked change runs to maintain bold, font size, etc.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `docx/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# DOCX creation, editing, and analysis ## Overview A .docx file is a ZIP archive containing XML files. ## Quick Reference | Task | Approach | |------|----------| | Read/analyze content | `pandoc` or unpack for raw XML | | Create new document | Use `docx-js` - see Creating New Documents below | | Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below | ### Converting .doc to .docx Legacy `.doc` files must be converted before editing: ```bash python scripts/office/soffice.py --headless --convert-to docx document.doc ``` ### Reading Content ```bash # Text extraction with tracked changes pandoc --track-changes=all document.docx -o output.md # Raw XML access python scripts/office/unpack.py document.docx unpacked/ ``` ### Converting to Images ```bash python sc

{{input}}
