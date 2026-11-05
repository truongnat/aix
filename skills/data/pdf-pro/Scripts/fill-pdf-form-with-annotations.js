#!/usr/bin/env node
/**
 * PDF Form Filler with Annotations
 * Overlays text annotations on non-fillable PDFs using coordinate data.
 * Requires: npm install pdf-lib
 *
 * The fields JSON must have the shape:
 *   { pages: [...], form_fields: [{ page_number, entry_bounding_box, entry_text: { text, font, font_size, font_color }, ... }] }
 *
 * Coordinate system:
 *   - If page has pdf_width/pdf_height → entry_bounding_box is in PDF pts (origin bottom-left)
 *   - Otherwise → entry_bounding_box is in image pixels (origin top-left)
 *
 * Usage:
 *   node fill-pdf-form-with-annotations.js input.pdf fields.json output.pdf
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function transformFromImageCoords(bbox, imageWidth, imageHeight, pdfWidth, pdfHeight) {
  const xScale = pdfWidth / imageWidth;
  const yScale = pdfHeight / imageHeight;
  const left = bbox[0] * xScale;
  const right = bbox[2] * xScale;
  const top = pdfHeight - bbox[1] * yScale;
  const bottom = pdfHeight - bbox[3] * yScale;
  return { x: left, y: Math.min(top, bottom), width: right - left, height: Math.abs(top - bottom) };
}

function transformFromPdfCoords(bbox, pdfHeight) {
  const left = bbox[0];
  const right = bbox[2];
  const y1 = pdfHeight - bbox[1];
  const y2 = pdfHeight - bbox[3];
  return { x: left, y: Math.min(y1, y2), width: right - left, height: Math.abs(y1 - y2) };
}

const [, , inputPdfPath, fieldsJsonPath, outputPdfPath] = process.argv;
if (!inputPdfPath || !fieldsJsonPath || !outputPdfPath) {
  console.error('Usage: node fill-pdf-form-with-annotations.js input.pdf fields.json output.pdf');
  process.exit(1);
}

const fieldsData = JSON.parse(readFileSync(fieldsJsonPath, 'utf8'));
const bytes = readFileSync(inputPdfPath);
const pdfDoc = await PDFDocument.load(bytes);
const pages = pdfDoc.getPages();

const pdfDimensions = {};
for (let i = 0; i < pages.length; i++) {
  const { width, height } = pages[i].getSize();
  pdfDimensions[i + 1] = { width, height };
}

let annotationCount = 0;

for (const field of fieldsData.form_fields) {
  if (!field.entry_text?.text) continue;
  const { text, font: fontName, font_size: fontSize = 14, font_color: fontColorHex = '000000' } = field.entry_text;
  if (!text) continue;

  const pageNum = field.page_number;
  const page = pages[pageNum - 1];
  if (!page) continue;

  const { width: pdfWidth, height: pdfHeight } = pdfDimensions[pageNum];
  const pageInfo = fieldsData.pages?.find((p) => p.page_number === pageNum) ?? {};

  let rect;
  if ('pdf_width' in pageInfo) {
    rect = transformFromPdfCoords(field.entry_bounding_box, pdfHeight);
  } else {
    const imageWidth = pageInfo.image_width ?? pdfWidth;
    const imageHeight = pageInfo.image_height ?? pdfHeight;
    rect = transformFromImageCoords(field.entry_bounding_box, imageWidth, imageHeight, pdfWidth, pdfHeight);
  }

  const color = hexToRgb(fontColorHex.replace('#', '').padEnd(6, '0'));
  const embeddedFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(text, {
    x: rect.x,
    y: rect.y + (rect.height - fontSize) / 2,
    size: fontSize,
    font: embeddedFont,
    color,
    maxWidth: rect.width,
  });

  annotationCount++;
}

const outputBytes = await pdfDoc.save();
writeFileSync(outputPdfPath, outputBytes);
console.log(`Successfully filled PDF form and saved to ${outputPdfPath}`);
console.log(`Added ${annotationCount} text annotations`);
