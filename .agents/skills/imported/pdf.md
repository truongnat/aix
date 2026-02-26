# Skill: pdf
Schema: antigrav.skill@v1

```json
{
  "description": "Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rota",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153433,
  "model": "qwen3:8b",
  "name": "pdf",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "pdf/SKILL.md",
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
Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill.

## When to Use
- Use when the task matches this skill domain.

## Examples
- from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
- from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
- reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `pdf/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# PDF Processing Guide ## Overview This guide covers essential PDF processing operations using Python libraries and command-line tools. For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions. ## Quick Start ```python from pypdf import PdfReader, PdfWriter # Read a PDF reader = PdfReader("document.pdf") print(f"Pages: {len(reader.pages)}") # Extract text text = "" for page in reader.pages: text += page.extract_text() ``` ## Python Libraries ### pypdf - Basic Operations #### Merge PDFs ```python from pypdf import PdfWriter, PdfReader writer = PdfWriter() for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]: reader = PdfReader(pdf_file) for page in reader.pages: writer.add_page(page) w

{{input}}
