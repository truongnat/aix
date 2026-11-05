import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { KbStore } from '../dist/index.js';

const record = { id: 'record-alpha', kind: 'decision', title: 'choice', body: 'content', tags: ['kb'], version: 'one', createdAt: 'today' };

async function fixture(t, handler) {
  const dir = await mkdtemp(join(tmpdir(), 'aix-kb-client-'));
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  return { dir, url: `http://127.0.0.1:${server.address().port}` };
}

for (const credentials of [{ apiKey: 'client-key' }, { masterPassword: 'management-password' }]) {
  test(`all memory operations authenticate with ${Object.keys(credentials)[0]}`, async t => {
    const { dir, url } = await fixture(t, async (req, res) => {
      const authorized = credentials.apiKey ? req.headers['x-api-key'] === 'client-key' : req.headers['x-master-password'] === 'management-password';
      if (!authorized) { res.writeHead(403).end(); return; }
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'POST') { for await (const _chunk of req) {} res.end('{"ok":true}'); }
      else res.end(JSON.stringify(req.url.includes('/record-alpha') ? record : [record]));
    });
    const store = new KbStore(url, dir, credentials);
    await store.push(record);
    assert.deepEqual(await store.get(record.id), record);
    assert.deepEqual(await store.search('choice'), [record]);
    assert.deepEqual(await store.list(), [record]);
    assert.deepEqual(await readdir(dir), [], 'authenticated writes must not fall back to local storage');
  });
}

for (const status of [401, 403]) {
  for (const operation of ['push', 'get', 'search', 'list']) {
    test(`${operation} rejects HTTP ${status} without entering markdown fallback`, async t => {
      let reject = true;
      const { dir, url } = await fixture(t, (req, res) => {
        if (reject) { res.writeHead(status).end(); return; }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(req.url.includes('/record-alpha') ? record : [record]));
      });
      const store = new KbStore(url, dir, { apiKey: 'wrong-key' });
      const args = { push: record, get: record.id, search: 'choice', list: undefined };
      await assert.rejects(store[operation](args[operation]), new RegExp(String(status)));
      assert.deepEqual(await readdir(dir), [], 'authorization failure must never write a fallback record');
      reject = false;
      assert.deepEqual(await store.get(record.id), record, 'authorization failures must not permanently disable the server');
    });
  }
}

test('unavailable server retains markdown fallback', async t => {
  const { dir, url } = await fixture(t, (_req, res) => res.writeHead(503).end());
  const store = new KbStore(url, dir);
  await store.push(record);
  assert.deepEqual(await store.get(record.id), record);
});
