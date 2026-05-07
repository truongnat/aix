#!/usr/bin/env node
/**
 * Fillable Fields Filler
 * Fills form fields in a fillable PDF using a JSON field values file.
 * Requires: npm install pdf-lib
 *
 * JSON format: array of { field_id, page, value }
 *
 * Usage:
 *   node fill-fillable-fields.js input.pdf field_values.json output.pdf
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib';

const [, , inputPdfPath, fieldsJsonPath, outputPdfPath] = process.argv;
if (!inputPdfPath || !fieldsJsonPath || !outputPdfPath) {
  console.error('Usage: node fill-fillable-fields.js input.pdf field_values.json output.pdf');
  process.exit(1);
}

const fields = JSON.parse(readFileSync(fieldsJsonPath, 'utf8'));
const bytes = readFileSync(inputPdfPath);
const pdfDoc = await PDFDocument.load(bytes);
const form = pdfDoc.getForm();

let hasError = false;

for (const fieldSpec of fields) {
  if (!('value' in fieldSpec)) continue;
  const { field_id, value } = fieldSpec;

  let field;
  try {
    field = form.getField(field_id);
  } catch {
    console.error(`ERROR: \`${field_id}\` is not a valid field ID`);
    hasError = true;
    continue;
  }

  if (field instanceof PDFTextField) {
    field.setText(String(value));
  } else if (field instanceof PDFCheckBox) {
    if (value === true || value === 'true' || value === '/Yes' || value === 'Yes') {
      field.check();
    } else {
      field.uncheck();
    }
  } else if (field instanceof PDFRadioGroup) {
    const options = field.getOptions();
    if (!options.includes(value)) {
      console.error(`ERROR: Invalid value "${value}" for radio group field "${field_id}". Valid values are: ${JSON.stringify(options)}`);
      hasError = true;
      continue;
    }
    field.select(value);
  } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
    const options = field.getOptions();
    if (!options.includes(value)) {
      console.error(`ERROR: Invalid value "${value}" for choice field "${field_id}". Valid values are: ${JSON.stringify(options)}`);
      hasError = true;
      continue;
    }
    field.select(value);
  }
}

if (hasError) process.exit(1);

form.flatten();
const outputBytes = await pdfDoc.save();
writeFileSync(outputPdfPath, outputBytes);
console.log(`Successfully filled PDF and saved to ${outputPdfPath}`);
