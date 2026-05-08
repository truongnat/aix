#!/usr/bin/env node
/**
 * Form Structure Extractor
 * Extracts text labels, horizontal lines, checkboxes, and row boundaries from a non-fillable PDF.
 * Requires: npm install pdfjs-dist
 *
 * Usage:
 *   node extract-form-structure.js input.pdf output.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

GlobalWorkerOptions.workerSrc = '';

const [, , pdfPath, outputPath] = process.argv;
if (!pdfPath || !outputPath) {
  console.error('Usage: node extract-form-structure.js input.pdf output.json');
  process.exit(1);
}

console.log(`Extracting structure from ${pdfPath}...`);

const data = readFileSync(pdfPath);
const loadingTask = getDocument({ data: new Uint8Array(data) });
const pdf = await loadingTask.promise;

const structure = { pages: [], labels: [], lines: [], checkboxes: [], row_boundaries: [] };

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });

  structure.pages.push({ page_number: pageNum, width: viewport.width, height: viewport.height });

  // Extract text content
  const textContent = await page.getTextContent();
  for (const item of textContent.items) {
    if (item.str && item.str.trim()) {
      const [, , , , tx, ty] = item.transform;
      const x0 = tx;
      const top = viewport.height - ty - item.height;
      const x1 = tx + item.width;
      const bottom = top + item.height;
      structure.labels.push({
        page: pageNum,
        text: item.str.trim(),
        x0: Math.round(x0 * 10) / 10,
        top: Math.round(top * 10) / 10,
        x1: Math.round(x1 * 10) / 10,
        bottom: Math.round(bottom * 10) / 10,
      });
    }
  }

  // Extract operator stream for lines and rectangles
  const ops = await page.getOperatorList();
  const { fnArray, argsArray } = ops;

  let currentPath = [];
  let currentX = 0, currentY = 0;

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];

    // moveTo (m)
    if (fn === 13) { currentX = args[0]; currentY = args[1]; currentPath = [[currentX, currentY]]; }
    // lineTo (l)
    else if (fn === 14) { currentX = args[0]; currentY = args[1]; currentPath.push([currentX, currentY]); }
    // rectangle (re)
    else if (fn === 16) {
      const [rx, ry, rw, rh] = args;
      const x0 = Math.round(rx * 10) / 10;
      const y0 = Math.round((viewport.height - ry - rh) * 10) / 10;
      const x1 = Math.round((rx + rw) * 10) / 10;
      const y1 = Math.round((viewport.height - ry) * 10) / 10;
      const w = Math.abs(rw), h = Math.abs(rh);
      if (5 <= w && w <= 15 && 5 <= h && h <= 15 && Math.abs(w - h) < 2) {
        structure.checkboxes.push({ page: pageNum, x0, top: y0, x1, bottom: y1, center_x: Math.round((x0 + x1) / 2 * 10) / 10, center_y: Math.round((y0 + y1) / 2 * 10) / 10 });
      }
      currentPath = [];
    }
    // stroke (S or s)
    else if (fn === 25 || fn === 26) {
      if (currentPath.length === 2) {
        const [x0, y0] = currentPath[0];
        const [x1, y1] = currentPath[1];
        const lineLen = Math.abs(x1 - x0);
        if (Math.abs(y0 - y1) < 1 && lineLen > viewport.width * 0.5) {
          structure.lines.push({
            page: pageNum,
            y: Math.round((viewport.height - y0) * 10) / 10,
            x0: Math.round(Math.min(x0, x1) * 10) / 10,
            x1: Math.round(Math.max(x0, x1) * 10) / 10,
          });
        }
      }
      currentPath = [];
    }
  }
}

// Compute row boundaries from horizontal lines
const linesByPage = {};
for (const line of structure.lines) {
  if (!linesByPage[line.page]) linesByPage[line.page] = [];
  linesByPage[line.page].push(line.y);
}
for (const [page, ys] of Object.entries(linesByPage)) {
  const sorted = [...new Set(ys)].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    structure.row_boundaries.push({ page: parseInt(page), row_top: sorted[i], row_bottom: sorted[i + 1], row_height: Math.round((sorted[i + 1] - sorted[i]) * 10) / 10 });
  }
}

writeFileSync(outputPath, JSON.stringify(structure, null, 2));
console.log(`Found:`);
console.log(`  - ${structure.pages.length} pages`);
console.log(`  - ${structure.labels.length} text labels`);
console.log(`  - ${structure.lines.length} horizontal lines`);
console.log(`  - ${structure.checkboxes.length} checkboxes`);
console.log(`  - ${structure.row_boundaries.length} row boundaries`);
console.log(`Saved to ${outputPath}`);
