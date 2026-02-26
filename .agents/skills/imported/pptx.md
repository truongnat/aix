# Skill: pptx
Schema: antigrav.skill@v1

```json
{
  "description": "Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from a",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153434,
  "model": "qwen3:8b",
  "name": "pptx",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "pptx/SKILL.md",
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
Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Text extraction
python -m markitdown presentation.pptx

# Visual overview
python scripts/thumbnail.py presentation.pptx

# Raw XML
python scripts/office/unpack.py presentation.pptx unpacked/
- python -m markitdown output.pptx
- python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|this.*(page|slide).*layout"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `pptx/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# PPTX Skill ## Quick Reference | Task | Guide | |------|-------| | Read/analyze content | `python -m markitdown presentation.pptx` | | Edit or create from template | Read `editing.md` | | Create from scratch | Read `pptxgenjs.md` | --- ## Reading Content ```bash # Text extraction python -m markitdown presentation.pptx # Visual overview python scripts/thumbnail.py presentation.pptx # Raw XML python scripts/office/unpack.py presentation.pptx unpacked/ ``` --- ## Editing Workflow **Read `editing.md` for full details.** 1. Analyze template with `thumbnail.py` 2. Unpack → manipulate slides → edit content → clean → pack --- ## Creating from Scratch **Read `pptxgenjs.md` for full details.** Use when no template or reference presentation is avai

{{input}}
