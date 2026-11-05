import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import bcrypt from 'bcryptjs';

const master = 'test-management-credential';
const apiKey = `kb_live_${'a'.repeat(64)}`;
const record = { id: 'record-alpha', kind: 'decision', title: 'private decision', body: 'api_key=abcdefghijklmnopqrstuvwx', tags: ['private'], version: 'one', createdAt: 'today' };

async function startServer(t, extraEnv = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'aix-kb-service-'));
  await writeFile(join(dir, 'api-keys.json'), JSON.stringify([{ hashedKey: await bcrypt.hash(apiKey, 4), label: 'test', createdAt: 'today' }]));
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const env = { ...process.env, KB_MASTER_PASSWORD: master, KB_DATA_DIR: dir, PORT: String(port) };
  delete env.KB_HOST;
  Object.assign(env, extraEnv);
  const child = spawn(process.execPath, [fileURLToPath(new URL('../dist/main.js', import.meta.url))], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
    await rm(dir, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`kb-server exited before health: ${logs}`);
    try { if ((await fetch(`${url}/health`)).ok) return { url, dir, child, port }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`kb-server health timeout: ${logs}`);
}

test('anonymous clients cannot read, write, or shut down the service', async t => {
  const { url } = await startServer(t);
  assert.equal((await fetch(`${url}/api/v1/memory`)).status, 403);
  assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })).status, 403);
  assert.equal((await fetch(`${url}/shutdown`, { method: 'POST' })).status, 403);
  assert.equal((await fetch(`${url}/health`)).status, 200);
});

test('API keys can use memory but only the master password can shut down', async t => {
  const { url, child } = await startServer(t);
  const headers = { 'x-api-key': apiKey, 'Content-Type': 'application/json' };
  assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify({ ...record, body: 'safe decision' }) })).status, 201);
  assert.equal((await (await fetch(`${url}/api/v1/memory/${record.id}`, { headers })).json()).id, record.id);
  assert.equal((await fetch(`${url}/shutdown`, { method: 'POST', headers })).status, 403);
  assert.equal((await fetch(`${url}/shutdown`, { method: 'POST', headers: { 'x-master-password': 'wrong' } })).status, 403);
  const exited = once(child, 'exit');
  assert.equal((await fetch(`${url}/shutdown`, { method: 'POST', headers: { 'x-master-password': master } })).status, 201);
  const [code] = await exited;
  assert.equal(code, 0);
});

test('direct HTTP writes redact secrets before SQLite and cache persistence', async t => {
  const { url, dir } = await startServer(t);
  const headers = { 'x-master-password': master, 'Content-Type': 'application/json' };
  assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify(record) })).status, 201);
  const saved = await (await fetch(`${url}/api/v1/memory/${record.id}`, { headers })).json();
  assert.equal(saved.body, '••••');
  assert.equal(saved.id, record.id);
  assert.deepEqual(saved.tags, ['private']);
  const list = await (await fetch(`${url}/api/v1/memory`, { headers })).json();
  assert.deepEqual(list, [saved]);
  const search = await (await fetch(`${url}/api/v1/memory/search?q=decision`, { headers })).json();
  assert.deepEqual(search, [saved]);
  for (const name of ['memory.db', 'memory.db-wal']) {
    const bytes = await readFile(join(dir, name));
    assert.equal(bytes.includes(Buffer.from('abcdefghijklmnopqrstuvwx')), false, `${name} must not contain the original secret`);
  }
});

test('distinct PII-shaped IDs retain independent identity through writes, updates, and cached reads', async t => {
  const { url } = await startServer(t);
  const headers = { 'x-master-password': master, 'Content-Type': 'application/json' };
  const first = { ...record, id: 'alice@example.com', title: 'first decision', body: 'first content' };
  const second = { ...record, id: 'bob@example.com', title: 'second decision', body: 'second content' };
  for (const item of [first, second]) {
    assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify(item) })).status, 201);
    assert.deepEqual(await (await fetch(`${url}/api/v1/memory/${encodeURIComponent(item.id)}`, { headers })).json(), item);
  }
  const updated = { ...first, body: 'updated first content' };
  assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify(updated) })).status, 201);
  assert.deepEqual(await (await fetch(`${url}/api/v1/memory/${encodeURIComponent(first.id)}`, { headers })).json(), updated);
  assert.deepEqual(await (await fetch(`${url}/api/v1/memory/${encodeURIComponent(second.id)}`, { headers })).json(), second);
  const saved = await (await fetch(`${url}/api/v1/memory`, { headers })).json();
  assert.deepEqual(saved.sort((a, b) => a.id.localeCompare(b.id)), [updated, second]);
});

test('secret-bearing IDs are rejected without changing persisted records or echoing secrets', async t => {
  const { url, dir } = await startServer(t);
  const headers = { 'x-master-password': master, 'Content-Type': 'application/json' };
  const safe = { ...record, body: 'safe content' };
  assert.equal((await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify(safe) })).status, 201);
  const secret = 'abcdefghijklmnopqrstuvwx';
  const rejected = { ...safe, id: `api_key=${secret}`, body: 'rejected content' };
  const response = await fetch(`${url}/api/v1/memory`, { method: 'POST', headers, body: JSON.stringify(rejected) });
  assert.equal(response.status, 400);
  assert.equal((await response.text()).includes(secret), false);
  assert.deepEqual(await (await fetch(`${url}/api/v1/memory`, { headers })).json(), [safe]);
  for (const name of ['memory.db', 'memory.db-wal']) {
    const bytes = await readFile(join(dir, name));
    assert.equal(bytes.includes(Buffer.from(secret)), false);
    assert.equal(bytes.includes(Buffer.from('rejected content')), false);
  }
});

const externalAddress = Object.values(networkInterfaces()).flat().find(address => address?.family === 'IPv4' && !address.internal)?.address;

test('standalone server binds loopback unless KB_HOST explicitly overrides it', { skip: !externalAddress }, async t => {
  const local = await startServer(t);
  await assert.rejects(fetch(`http://${externalAddress}:${local.port}/health`, { signal: AbortSignal.timeout(1000) }));
  const container = await startServer(t, { KB_HOST: '0.0.0.0' });
  assert.equal((await fetch(`http://${externalAddress}:${container.port}/health`, { signal: AbortSignal.timeout(1000) })).status, 200);
});
