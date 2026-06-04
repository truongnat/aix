# markitdown

## Purpose

Convert rich documents into markdown the agent can inspect safely.

## Detect

```bash
markitdown --help
```

## Use When

- the user provides PDF, DOCX, PPTX, XLSX, HTML, or similar rich documents
- a non-code artifact is required for planning or review

## Do Not Use When

- the content is already plain markdown or text
- conversion would expose irrelevant sensitive material

## Example Commands

```bash
markitdown input.pdf > .harness/context/input.md
```

## Fallback

- ask the user for extracted text
- use an already provided text attachment

## Blocking Conditions

- block when the rich document is required and no safe text form is available
