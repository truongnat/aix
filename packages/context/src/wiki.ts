import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CodeAnalysis, FlowGraph } from './types.js';

export function toMermaid(flow: FlowGraph): string {
  const lines: string[] = ['graph TD'];
  for (const node of flow.nodes) {
    const safeId = node.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  ${safeId}["${node}"]`);
  }
  for (const edge of flow.edges) {
    const fromId = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
    const toId = edge.to.replace(/[^a-zA-Z0-9]/g, '_');
    const label = edge.label ? `|${edge.label}|` : '';
    lines.push(`  ${fromId} -->${label} ${toId}`);
  }
  return lines.join('\n');
}

export async function toWiki(analysis: CodeAnalysis, outDir: string): Promise<void> {
  await mkdir(outDir, { recursive: true });

  const indexLines: string[] = [
    '# Code Analysis',
    '',
    `- **Files:** ${analysis.files.length}`,
    `- **Functions:** ${analysis.files.reduce((s, f) => s + f.functions.length, 0)}`,
    `- **Classes:** ${analysis.files.reduce((s, f) => s + f.classes.length, 0)}`,
    `- **API Endpoints:** ${analysis.apis.length}`,
    `- **Flows:** ${analysis.flows.length}`,
    '',
    '## Files',
    '',
  ];

  const filesDir = join(outDir, 'files');
  await mkdir(filesDir, { recursive: true });

  for (const file of analysis.files) {
    const safeName = file.path.replace(/[/\\]/g, '_') + '.md';
    indexLines.push(`- [${file.path}](./files/${safeName})`);

    const fileLines: string[] = [
      `# ${file.path}`,
      '',
      `**Language:** ${file.language}`,
      '',
    ];

    if (file.functions.length > 0) {
      fileLines.push('## Functions', '');
      for (const fn of file.functions) {
        const params = fn.params.join(', ');
        fileLines.push(`- \`${fn.name}(${params})\` (lines ${fn.startLine}–${fn.endLine})`);
      }
      fileLines.push('');
    }

    if (file.classes.length > 0) {
      fileLines.push('## Classes', '');
      for (const cls of file.classes) {
        fileLines.push(`- \`${cls.name}\` (line ${cls.startLine})`);
        if (cls.methods.length > 0) {
          fileLines.push(`  - Methods: ${cls.methods.join(', ')}`);
        }
      }
      fileLines.push('');
    }

    if (file.imports.length > 0) {
      fileLines.push('## Imports', '');
      for (const imp of file.imports) {
        fileLines.push(`- \`${imp}\``);
      }
      fileLines.push('');
    }

    await writeFile(join(filesDir, safeName), fileLines.join('\n'), 'utf-8');
  }

  if (analysis.apis.length > 0) {
    indexLines.push('## API Endpoints', '');
    for (const api of analysis.apis) {
      indexLines.push(`- \`${api.method} ${api.route}\``);
    }
    indexLines.push('');
  }

  if (analysis.flows.length > 0) {
    indexLines.push('## Data Flows', '');

    const flowsDir = join(outDir, 'flows');
    await mkdir(flowsDir, { recursive: true });

    for (const flow of analysis.flows) {
      const safeName = flow.name.replace(/[/\\]/g, '_') + '.md';
      indexLines.push(`- [${flow.name}](./flows/${safeName})`);

      const flowLines: string[] = [
        `# Flow: ${flow.name}`,
        '',
        '```mermaid',
        toMermaid(flow),
        '```',
        '',
        '### Nodes',
        '',
      ];

      for (const node of flow.nodes) {
        flowLines.push(`- \`${node}\``);
      }

      flowLines.push('', '### Edges', '');
      for (const edge of flow.edges) {
        const label = edge.label ? ` "${edge.label}"` : '';
        flowLines.push(`- \`${edge.from} → ${edge.to}${label}\``);
      }

      await writeFile(join(flowsDir, safeName), flowLines.join('\n'), 'utf-8');
    }
  }

  await writeFile(join(outDir, 'index.md'), indexLines.join('\n'), 'utf-8');
}
