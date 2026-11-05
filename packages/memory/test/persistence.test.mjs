import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MarkdownStore, RedactedMemoryStore } from '@x/memory';
import { PolicyEngine } from '@x/policy';

const secret = `ghp_${'b'.repeat(36)}`;
const record = {
  id: '019a5555-1234-7654-8765-abcdef012345', kind: 'decision',
  title: `Persist ${secret}`, body: `credential ${secret}`,
  tags: ['keep', secret], version: '1.0.0', createdAt: '2026-11-05T11:22:33.444Z',
};

for (const decorated of [false, true]) {
  test(`${decorated ? 'RedactedMemoryStore' : 'MarkdownStore'} removes secrets from all persisted content fields and preserves metadata`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'aix-memory-redaction-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const markdown = new MarkdownStore(root);
    const store = decorated ? new RedactedMemoryStore(markdown, new PolicyEngine()) : markdown;
    await store.push(record);
    const raw = await readFile(join(root, '.aix/runtime/memory', `${record.id}.md`), 'utf8');
    assert.equal(raw.includes(secret), false);
    const loaded = await store.get(record.id);
    assert.deepEqual(loaded, { ...record, title: 'Persist ••••', body: 'credential ••••', tags: ['keep', '••••'] });
    assert.equal(record.tags[1], secret);
  });
}

test('MarkdownStore rejects secret-bearing record IDs instead of leaking secrets into filenames', async t => {
  const root = await mkdtemp(join(tmpdir(), 'aix-memory-id-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(new MarkdownStore(root).push({ ...record, id: secret }), /secret/i);
  assert.deepEqual(await readdir(root), []);
});

test('RedactedMemoryStore sanitizes legacy tags returned by its underlying store', async () => {
  const legacy = { push: async () => {}, get: async () => record, list: async () => [record], search: async () => [record] };
  const store = new RedactedMemoryStore(legacy, new PolicyEngine());
  for (const loaded of [await store.get(record.id), ...(await store.list()), ...(await store.search('credential'))]) {
    assert.deepEqual(loaded.tags, ['keep', '••••']);
    assert.equal(loaded.id, record.id);
    assert.equal(loaded.createdAt, record.createdAt);
  }
});

for (const decorated of [false, true]) {
  test(`${decorated ? 'RedactedMemoryStore' : 'MarkdownStore'} keeps two accepted email-shaped IDs distinct`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'aix-memory-email-ids-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const markdown = new MarkdownStore(root);
    const store = decorated ? new RedactedMemoryStore(markdown, new PolicyEngine()) : markdown;
    for (const id of ['alice@example.com', 'bob@example.com']) {
      await store.push({ ...record, id });
      const loaded = await store.get(id);
      assert.equal(loaded.id, id);
      assert.equal(loaded.body, 'credential ••••');
      assert.deepEqual(loaded.tags, ['keep', '••••']);
    }
    assert.deepEqual((await store.list()).map(rec => rec.id).sort(), ['alice@example.com', 'bob@example.com']);
    assert.deepEqual((await store.search('credential')).map(rec => rec.id).sort(), ['alice@example.com', 'bob@example.com']);
  });
}
