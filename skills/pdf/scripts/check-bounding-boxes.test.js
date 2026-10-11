/**
 * Tests for check-bounding-boxes.js
 * Run with: node --test check-bounding-boxes.test.js
 * Or with vitest if configured.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBoundingBoxMessages } from './check-bounding-boxes.js';

function makeData(fields) {
  return { form_fields: fields };
}

describe('getBoundingBoxMessages', () => {
  it('no intersections — success', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 30] },
      { description: 'Email', page_number: 1, label_bounding_box: [10, 40, 50, 60], entry_bounding_box: [60, 40, 150, 60] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('SUCCESS')));
    assert.ok(!msgs.some((m) => m.includes('FAILURE')));
  });

  it('label/entry intersection on same field', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 60, 30], entry_bounding_box: [50, 10, 150, 30] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('FAILURE') && m.includes('intersection')));
    assert.ok(!msgs.some((m) => m.includes('SUCCESS')));
  });

  it('intersection between different fields', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 30] },
      { description: 'Email', page_number: 1, label_bounding_box: [40, 20, 80, 40], entry_bounding_box: [160, 10, 250, 30] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('FAILURE') && m.includes('intersection')));
    assert.ok(!msgs.some((m) => m.includes('SUCCESS')));
  });

  it('different pages — no intersection', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 30] },
      { description: 'Email', page_number: 2, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 30] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('SUCCESS')));
    assert.ok(!msgs.some((m) => m.includes('FAILURE')));
  });

  it('entry height too small for font', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 20], entry_text: { font_size: 14 } },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('FAILURE') && m.includes('height')));
    assert.ok(!msgs.some((m) => m.includes('SUCCESS')));
  });

  it('entry height adequate', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 30], entry_text: { font_size: 14 } },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('SUCCESS')));
    assert.ok(!msgs.some((m) => m.includes('FAILURE')));
  });

  it('default font size (14) used when not specified', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 20], entry_text: {} },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('FAILURE') && m.includes('height')));
  });

  it('no entry_text — skips height check', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [60, 10, 150, 20] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('SUCCESS')));
    assert.ok(!msgs.some((m) => m.includes('FAILURE')));
  });

  it('many overlapping fields — aborts after ~20 messages', () => {
    const fields = Array.from({ length: 25 }, (_, i) => ({
      description: `Field${i}`,
      page_number: 1,
      label_bounding_box: [10, 10, 50, 30],
      entry_bounding_box: [20, 15, 60, 35],
    }));
    const msgs = getBoundingBoxMessages(makeData(fields));
    assert.ok(msgs.some((m) => m.includes('Aborting')));
    assert.ok(msgs.length < 30);
  });

  it('edge-touching boxes — no intersection', () => {
    const data = makeData([
      { description: 'Name', page_number: 1, label_bounding_box: [10, 10, 50, 30], entry_bounding_box: [50, 10, 150, 30] },
    ]);
    const msgs = getBoundingBoxMessages(data);
    assert.ok(msgs.some((m) => m.includes('SUCCESS')));
    assert.ok(!msgs.some((m) => m.includes('FAILURE')));
  });
});
