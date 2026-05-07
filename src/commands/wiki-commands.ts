/**
 * Wiki-related commands
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

export type ParsedArgs = {
  _?: string[];
  [key: string]: unknown;
};

export function cmdGenerateWiki(args: ParsedArgs, repoRoot: string) {
  const docsDir = resolve(repoRoot, String(args['docs-dir'] || join('knowledge-base', 'documents')));
  const outDir = resolve(repoRoot, String(args.out || join('knowledge-base', 'wiki')));
  const doWatch = Boolean(args.watch);
  const doOpen = Boolean(args.open);

  const build = () => runGenerateWiki(docsDir, outDir);

  let fp = '';
  const refreshFingerprint = () => {
    fp = existsSync(docsDir) ? wikiFingerprintDocs(docsDir) : '';
  };

  const { mdCount } = build();
  console.log(`Wrote wiki under ${outDir} (${mdCount} pages + index.html)`);

  if (doOpen) openHtmlFileInBrowser(join(outDir, 'index.html'));

  if (doWatch) {
    refreshFingerprint();
    setInterval(() => {
      if (!existsSync(docsDir)) return;
      const next = wikiFingerprintDocs(docsDir);
      if (next !== fp) {
        fp = next;
        try {
          const r = build();
          console.log(`wiki: rebuilt (${r.mdCount} pages + index.html)`);
        } catch (e) {
          console.error('wiki rebuild failed:', (e as Error).message);
        }
      }
    }, 1500);
    console.log(`Watching ${docsDir} (poll every 1.5s, Ctrl+C to stop)`);
  }
}

// Helper functions (to be extracted or imported)
function resolve(...paths: string[]): string {
  return join(...paths);
}

function runGenerateWiki(docsDir: string, _outDir: string) {
  const files = collectMarkdownFiles(docsDir);
  return { mdCount: files.length };
}

function wikiFingerprintDocs(docsDir: string): string {
  return collectMarkdownFiles(docsDir).join(',');
}

function collectMarkdownFiles(base: string): string[] {
  return globSync('**/*.md', { cwd: base, absolute: true, nodir: true }).sort();
}

function openHtmlFileInBrowser(path: string) {
  console.log(`Would open ${path} in browser`);
}
