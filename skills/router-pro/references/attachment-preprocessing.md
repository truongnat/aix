# Attachment preprocessing for prompt routing

Use this when the user prompt references attached files or local paths and the router needs the file content before analysis, optimization, or skill selection.

## Goal

Turn attached documents into compact, grounded text context before prompt optimization. Do not optimize the prompt from filenames alone when the file content changes intent, scope, or routing. MarkItDown is optional but recommended for cleaner first-pass extraction from PDF and Office-style documents.

## Clarify before processing

If the user says “process these files” or “optimize this with files” but does not state the goal, ask a short clarification before starting:

- Are we summarizing the files, extracting requirements/facts, optimizing the prompt, or implementing from the files?
- Should all files be processed, or only the ones relevant to the current request?
- Is installing optional conversion tooling allowed if MarkItDown is missing?

Skip clarification only when the user goal and file scope are already explicit.

## Decision path

1. Identify file references from the chat, explicit paths, or attached context.
2. Clarify intent if the goal, file scope, or install permission is ambiguous.
3. Classify each file:
   - Plain text/code/Markdown/JSON/YAML: read directly with normal repo tools.
   - PDF, DOCX, PPTX, XLSX, HTML, images with embedded text: convert with MarkItDown when available.
   - Large binary, locked, or unsupported file: report the limitation and ask for an accessible export only if content is required.
4. Convert only files needed for the current request.
5. Keep provenance in the optimized prompt: filename, page/sheet/section if available, and whether content was extracted or inferred.
6. Summarize or chunk large output before routing to keep token use proportional to the task.

## MarkItDown command

From this repo:

```bash
node dist/tools.js analyze-doc path/to/file.pdf path/to/spec.docx
```

From an installed project bundle:

```bash
node .agents/devkit/dist/tools.js analyze-doc path/to/file.pdf path/to/spec.docx
```

From the npm package:

```bash
npx @david-choi/devkit analyze-doc path/to/file.pdf
```

Direct fallback when the repo helper is unavailable:

```bash
markitdown path/to/file.pdf
```

Optional recommended dependency:

```bash
pip install "markitdown[all]"
```

Do not install it automatically. If the command is missing, explain that MarkItDown is optional but recommended for cleaner conversion, then ask before installing.

## Routing rules

- If the user asks to summarize, extract, compare, or audit document content, route to `content-analysis-pro`.
- If the document is context for implementation, first extract the relevant facts, then route to the smallest working skill set for the actual implementation.
- If extracted content includes secrets, credentials, PII, contracts, medical, legal, or financial material, add the relevant safety/privacy skill and minimize reproduction.

## Prompt optimization shape

Use this structure internally:

```markdown
User goal:
<original goal, unchanged>

Provided files:
- <file>: <type>, extraction method, relevant sections

Extracted context:
<brief grounded summary or selected excerpts>

Optimized task:
<specific actionable request with constraints and output format>
```

## Failure modes

- Do not route from filename only when the user clearly expects file content to be considered.
- Do not paste an entire converted document into the final response unless requested.
- Do not treat OCR or conversion output as perfect; label uncertainty where extraction quality is weak.
- Do not install MarkItDown automatically; ask first even when it would improve the flow.
