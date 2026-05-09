import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Analyzes document files (PDF, Word, Excel, PowerPoint, etc.) and converts them to Markdown
 * using Microsoft's markitdown CLI.
 *
 * Optional recommended dependency: pip install 'markitdown[all]'
 */
function analyzeDocuments(filePaths: string[]) {
  if (filePaths.length === 0) {
    throw new Error('Usage: devkit analyze-doc <path-to-file> [more-files...]');
  }

  try {
    execFileSync('markitdown', ['--version'], { stdio: 'ignore' });
  } catch {
    throw new Error(
      [
        'MarkItDown is not installed or not in PATH.',
        'It is optional but recommended for cleaner PDF/Office conversion.',
        'Install it only after user confirmation: pip install "markitdown[all]"',
      ].join('\n'),
    );
  }

  for (const filePath of filePaths) {
    const absolutePath = resolve(filePath);

    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    if (!statSync(absolutePath).isFile()) {
      throw new Error(`Not a file: ${absolutePath}`);
    }

    console.log(`--- BEGIN FILE: ${absolutePath} ---`);

    try {
      const output = execFileSync('markitdown', [absolutePath], {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 50,
      });
      console.log(output.trimEnd());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to analyze document ${absolutePath}: ${message}`);
    }

    console.log(`--- END FILE: ${absolutePath} ---`);
  }
}

const args = process.argv.slice(2);
try {
  analyzeDocuments(args);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
