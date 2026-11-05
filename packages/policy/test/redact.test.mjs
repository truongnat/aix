import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as policy from '@x/policy';

const secret = `ghp_${'a'.repeat(36)}`;

test('redactStrings sanitizes nested string values without changing keys, metadata, or the input', () => {
  assert.equal(typeof policy.redactStrings, 'function');
  const input = {
    [secret]: { text: `credential ${secret}`, list: [secret, 5000, null, true] },
    id: '019a5555-1234-7654-8765-abcdef012345',
    createdAt: '2026-11-05T11:22:33.444Z',
    hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    count: 1234567890,
  };
  const clean = policy.redactStrings(input);
  assert.notEqual(clean, input);
  assert.deepEqual(Object.keys(clean), Object.keys(input));
  assert.deepEqual(clean[secret], { text: 'credential ••••', list: ['••••', 5000, null, true] });
  assert.equal(clean.id, input.id);
  assert.equal(clean.createdAt, input.createdAt);
  assert.equal(clean.hash, input.hash);
  assert.equal(clean.count, 1234567890);
  assert.equal(input[secret].text, `credential ${secret}`);
});

test('redaction does not mistake source numeric literals, timestamps, IDs, or hashes for phone numbers', () => {
  const source = 'export const timeout = 5000; export const amount = 1234567890;';
  for (const value of [source, '2026-11-05T11:22:33.444Z', '019a5555-1234-7654-8765-abcdef012345', '0123456789abcdef0123456789abcdef']) {
    assert.equal(policy.redact(value).clean, value);
  }
  assert.equal(policy.redact('Call +1 (415) 555-2671').clean.includes('555-2671'), false);
});
