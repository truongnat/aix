export function renderMermaid(diagram: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mermaid Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    body { margin: 2rem; font-family: system-ui, sans-serif; background: #fff; }
    .mermaid { max-width: 100%; }
  </style>
</head>
<body>
  <pre class="mermaid">${diagram}</pre>
  <script>mermaid.initialize({ startOnLoad: true });</script>
</body>
</html>`;
}
