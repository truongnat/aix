#!/usr/bin/env node
/**
 * Fillable Fields Checker
 * Checks whether a PDF has fillable form fields.
 * Requires: npm install pdf-lib
 *
 * Usage:
 *   node check-fillable-fields.js input.pdf
 */

import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const pdfPath = process.argv[2];
if (!pdfPath) { console.error('Usage: node check-fillable-fields.js input.pdf'); process.exit(1); }

const bytes = readFileSync(pdfPath);
const pdfDoc = await PDFDocument.load(bytes);
const form = pdfDoc.getForm();
const fields = form.getFields();

if (fields.length > 0) {
  console.log('This PDF has fillable form fields');
  console.log(`Found ${fields.length} field(s):`);
  for (const field of fields) {
    console.log(`  - ${field.getName()} (${field.constructor.name})`);
  }
} else {
  console.log('This PDF does not have fillable form fields; you will need to visually determine where to enter data');
}
