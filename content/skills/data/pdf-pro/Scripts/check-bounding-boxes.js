#!/usr/bin/env node
/**
 * Bounding Box Checker
 * Validates that form field bounding boxes do not intersect and are sized correctly.
 *
 * Usage:
 *   node check-bounding-boxes.js fields.json
 */

import { readFileSync } from 'node:fs';

export function getBoundingBoxMessages(data) {
  const messages = [];
  const fields = typeof data === 'string' ? JSON.parse(data) : data;
  messages.push(`Read ${fields.form_fields.length} fields`);

  function rectsIntersect(r1, r2) {
    const disjointH = r1[0] >= r2[2] || r1[2] <= r2[0];
    const disjointV = r1[1] >= r2[3] || r1[3] <= r2[1];
    return !(disjointH || disjointV);
  }

  const rectsAndFields = [];
  for (const f of fields.form_fields) {
    rectsAndFields.push({ rect: f.label_bounding_box, rectType: 'label', field: f });
    rectsAndFields.push({ rect: f.entry_bounding_box, rectType: 'entry', field: f });
  }

  let hasError = false;

  for (let i = 0; i < rectsAndFields.length; i++) {
    const ri = rectsAndFields[i];
    for (let j = i + 1; j < rectsAndFields.length; j++) {
      const rj = rectsAndFields[j];
      if (ri.field.page_number === rj.field.page_number && rectsIntersect(ri.rect, rj.rect)) {
        hasError = true;
        if (ri.field === rj.field) {
          messages.push(`FAILURE: intersection between label and entry bounding boxes for \`${ri.field.description}\` (${JSON.stringify(ri.rect)}, ${JSON.stringify(rj.rect)})`);
        } else {
          messages.push(`FAILURE: intersection between ${ri.rectType} bounding box for \`${ri.field.description}\` (${JSON.stringify(ri.rect)}) and ${rj.rectType} bounding box for \`${rj.field.description}\` (${JSON.stringify(rj.rect)})`);
        }
        if (messages.length >= 20) {
          messages.push('Aborting further checks; fix bounding boxes and try again');
          return messages;
        }
      }
    }

    if (ri.rectType === 'entry' && ri.field.entry_text !== undefined) {
      const fontSize = ri.field.entry_text.font_size ?? 14;
      const entryHeight = ri.rect[3] - ri.rect[1];
      if (entryHeight < fontSize) {
        hasError = true;
        messages.push(`FAILURE: entry bounding box height (${entryHeight}) for \`${ri.field.description}\` is too short for the text content (font size: ${fontSize}). Increase the box height or decrease the font size.`);
        if (messages.length >= 20) {
          messages.push('Aborting further checks; fix bounding boxes and try again');
          return messages;
        }
      }
    }
  }

  if (!hasError) messages.push('SUCCESS: All bounding boxes are valid');
  return messages;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const filePath = process.argv[2];
  if (!filePath) { console.error('Usage: node check-bounding-boxes.js fields.json'); process.exit(1); }
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const messages = getBoundingBoxMessages(data);
  for (const msg of messages) console.log(msg);
}
