#!/usr/bin/env node
/**
 * Validation Image Creator
 * Draws red (entry) and blue (label) bounding boxes on a page image for visual validation.
 * Requires: npm install canvas
 *
 * Usage:
 *   node create-validation-image.js <page_number> <fields.json> <input_image.png> <output_image.png>
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createCanvas, loadImage } from 'canvas';

const [, , pageNumStr, fieldsJsonPath, inputImagePath, outputImagePath] = process.argv;
if (!pageNumStr || !fieldsJsonPath || !inputImagePath || !outputImagePath) {
  console.error('Usage: node create-validation-image.js <page_number> <fields.json> <input_image.png> <output_image.png>');
  process.exit(1);
}

const pageNumber = parseInt(pageNumStr, 10);
const data = JSON.parse(readFileSync(fieldsJsonPath, 'utf8'));
const img = await loadImage(inputImagePath);

const canvas = createCanvas(img.width, img.height);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);

let numBoxes = 0;
for (const field of data.form_fields) {
  if (field.page_number === pageNumber) {
    const [ex0, ey0, ex1, ey1] = field.entry_bounding_box;
    const [lx0, ly0, lx1, ly1] = field.label_bounding_box;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex0, ey0, ex1 - ex0, ey1 - ey0);

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(lx0, ly0, lx1 - lx0, ly1 - ly0);

    numBoxes += 2;
  }
}

const buffer = canvas.toBuffer('image/png');
writeFileSync(outputImagePath, buffer);
console.log(`Created validation image at ${outputImagePath} with ${numBoxes} bounding boxes`);
