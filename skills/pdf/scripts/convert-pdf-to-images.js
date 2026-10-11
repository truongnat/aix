#!/usr/bin/env node
/**
 * PDF to Images Converter
 * Converts PDF pages to PNG images using pdftoppm (poppler-utils).
 * Requires: poppler-utils installed on the system (brew install poppler / apt install poppler-utils)
 *
 * Usage:
 *   node convert-pdf-to-images.js input.pdf output_dir
 *   node convert-pdf-to-images.js input.pdf output_dir --max-dim 1500
 */

import { mkdirSync, readdirSync, renameSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: { 'max-dim': { type: 'string', default: '1000' } },
  allowPositionals: true,
});

const [pdfPath, outputDir] = positionals;
if (!pdfPath || !outputDir) {
  console.error('Usage: node convert-pdf-to-images.js <input.pdf> <output_dir> [--max-dim N]');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const maxDim = parseInt(values['max-dim'], 10);
const prefix = join(outputDir, 'page');

// pdftoppm -r 200 -png input.pdf prefix
const result = spawnSync('pdftoppm', ['-r', '200', '-png', pdfPath, prefix], { encoding: 'utf8' });
if (result.error) {
  console.error('Error: pdftoppm not found. Install poppler-utils (brew install poppler or apt install poppler-utils)');
  process.exit(1);
}
if (result.status !== 0) {
  console.error(`pdftoppm failed: ${result.stderr}`);
  process.exit(1);
}

// pdftoppm names files like prefix-1.png or prefix-01.png
const pngFiles = readdirSync(outputDir).filter((f) => f.endsWith('.png')).sort();
console.log(`Converted ${pngFiles.length} pages to PNG images`);

for (const file of pngFiles) {
  const fullPath = join(outputDir, file);
  const { size } = statSync(fullPath);
  console.log(`  ${file} (${(size / 1024).toFixed(1)} KB)`);
}

if (maxDim && pngFiles.length > 0) {
  // Use sips (macOS) or convert (ImageMagick) to resize if needed
  const resizeTool = process.platform === 'darwin' ? 'sips' : 'convert';
  if (resizeTool === 'sips') {
    for (const file of pngFiles) {
      const fullPath = join(outputDir, file);
      spawnSync('sips', ['--resampleHeightWidthMax', String(maxDim), fullPath], { encoding: 'utf8' });
    }
  }
  // On Linux: use ImageMagick's convert or mogrify
  // mogrify -resize ${maxDim}x${maxDim}> *.png
}
