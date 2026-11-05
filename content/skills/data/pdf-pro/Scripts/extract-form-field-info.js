#!/usr/bin/env node
/**
 * Form Field Info Extractor
 * Extracts form field metadata from a fillable PDF.
 * Requires: npm install pdf-lib
 *
 * Usage:
 *   node extract-form-field-info.js input.pdf output.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib';

const [, , pdfPath, jsonOutputPath] = process.argv;
if (!pdfPath || !jsonOutputPath) {
  console.error('Usage: node extract-form-field-info.js input.pdf output.json');
  process.exit(1);
}

const bytes = readFileSync(pdfPath);
const pdfDoc = await PDFDocument.load(bytes);
const form = pdfDoc.getForm();
const fields = form.getFields();

const fieldInfo = fields.map((field) => {
  const name = field.getName();
  const acroField = field.acroField;
  const widgets = acroField.getWidgets();

  let page = null;
  let rect = null;
  if (widgets.length > 0) {
    const widget = widgets[0];
    const widgetPage = pdfDoc.getPages().findIndex((p) => {
      try { return p.node.lookupMaybe(p.node.get('Annots'))?.asArray?.()?.some?.((a) => a === widget.dict); } catch { return false; }
    });
    page = widgetPage >= 0 ? widgetPage + 1 : null;
    const r = widget.getRectangle();
    if (r) rect = [r.x, r.y, r.x + r.width, r.y + r.height];
  }

  const base = { field_id: name, page, rect };

  if (field instanceof PDFTextField) {
    return { ...base, type: 'text' };
  } else if (field instanceof PDFCheckBox) {
    return { ...base, type: 'checkbox', checked_value: '/Yes', unchecked_value: '/Off' };
  } else if (field instanceof PDFRadioGroup) {
    const options = field.getOptions();
    return { ...base, type: 'radio_group', radio_options: options.map((v) => ({ value: v, rect: null })) };
  } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
    const options = field.getOptions();
    return { ...base, type: 'choice', choice_options: options.map((v) => ({ value: v, text: v })) };
  } else {
    return { ...base, type: 'unknown' };
  }
});

// Sort by page then vertical position (top-to-bottom)
fieldInfo.sort((a, b) => {
  if (a.page !== b.page) return (a.page ?? 0) - (b.page ?? 0);
  const ay = a.rect ? -a.rect[1] : 0;
  const by = b.rect ? -b.rect[1] : 0;
  return ay - by;
});

writeFileSync(jsonOutputPath, JSON.stringify(fieldInfo, null, 2));
console.log(`Wrote ${fieldInfo.length} fields to ${jsonOutputPath}`);
