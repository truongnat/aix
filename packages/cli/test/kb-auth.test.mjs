import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';
import ts from 'typescript';

const execute = promisify(execFile);
const cli = fileURLToPath(new URL('../dist/index.js', import.meta.url));

async function managerFixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'aix-kb-manager-'));
  const source = await readFile(new URL('../src/kb-server-manager.ts', import.meta.url), 'utf8');
  const manager = join(dir, 'manager.mjs');
  await writeFile(manager, ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText);
  const env = { ...process.env, HOME: dir, USERPROFILE: dir };
  for (const key of ['KB_API_KEY', 'KB_MASTER_PASSWORD', 'KB_DATA_DIR', 'KB_HOST']) delete env[key];
  t.after(async () => {
    try { const child = JSON.parse(await readFile(join(dir, 'child.json'), 'utf8')); process.kill(child.pid, 'SIGTERM'); } catch {}
    await rm(dir, { recursive: true, force: true });
  });
  return { dir, env, run: (code, overrides = {}) => execute(process.execPath, ['--input-type=module', '-e', `const manager = await import(${JSON.stringify(pathToFileURL(manager).href)}); ${code}`], { env: { ...env, ...overrides }, timeout: 20000 }) };
}

async function httpFixture(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return String(server.address().port);
}

test('management credentials are random, stable across processes, and private per user', async t => {
  const first = await managerFixture(t);
  const second = await managerFixture(t);
  const code = 'console.log(JSON.stringify(manager.getKbCredentials()));';
  const a = JSON.parse((await first.run(code)).stdout);
  const b = JSON.parse((await first.run(code)).stdout);
  const c = JSON.parse((await second.run(code)).stdout);
  assert.match(a.masterPassword, /^[a-f0-9]{64}$/);
  assert.equal(a.masterPassword, b.masterPassword);
  assert.notEqual(a.masterPassword, c.masterPassword);
  const credentialDir = join(first.dir, '.aix', 'kb');
  assert.equal((await stat(credentialDir)).mode & 0o077, 0);
  const files = await readdir(credentialDir);
  assert.equal(files.length, 1);
  assert.equal((await stat(join(credentialDir, files[0]))).mode & 0o077, 0);
  const explicit = JSON.parse((await first.run(code, { KB_API_KEY: 'explicit-api-key', KB_MASTER_PASSWORD: 'explicit-master' })).stdout);
  assert.deepEqual(explicit, { apiKey: 'explicit-api-key', masterPassword: 'explicit-master' });
});

test('automatic startup passes its private management credential and authenticated shutdown uses it', async t => {
  const fixture = await managerFixture(t);
  const main = join(fixture.dir, 'server.mjs');
  const capture = join(fixture.dir, 'child.json');
  await writeFile(main, `import { createServer } from 'node:http'; import { writeFileSync } from 'node:fs';
writeFileSync(${JSON.stringify(capture)}, JSON.stringify({ password: process.env.KB_MASTER_PASSWORD, host: process.env.KB_HOST, pid: process.pid }));
createServer((req,res) => { if (req.url === '/health') { res.end('{}'); return; } if (req.url === '/shutdown' && req.headers['x-master-password'] === process.env.KB_MASTER_PASSWORD) { res.end('{}'); setTimeout(() => process.exit(0), 20); return; } res.writeHead(403).end(); }).listen(Number(process.env.PORT), process.env.KB_HOST);
`);
  // A distinct ephemeral port is selected inside the isolated manager process.
  const { stdout } = await fixture.run(`
const net = await import('node:net'); const socket = net.createServer(); await new Promise(r => socket.listen(0, '127.0.0.1', r)); const port = socket.address().port; await new Promise(r => socket.close(r));
process.env.KB_PORT = String(port);
const fresh = await import(${JSON.stringify(pathToFileURL(join(fixture.dir, 'manager.mjs')).href)} + '?startup');
const url = await fresh.ensureKbServer(); if (!url) throw new Error('startup failed');
console.log(JSON.stringify({ url, credentials: fresh.getKbCredentials() })); await fresh.shutdownKbServer({ ownedOnly: true });
`, { KB_SERVER_MAIN: main });
  const child = JSON.parse(await readFile(capture, 'utf8'));
  const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('{')));
  assert.equal(child.password, result.credentials.masterPassword);
  assert.equal(child.host, '127.0.0.1');
  assert.match(child.password, /^[a-f0-9]{64}$/);
});

test('shutdown rejects an authorization failure instead of reporting success', async t => {
  const fixture = await managerFixture(t);
  const port = await httpFixture(t, (req, res) => { if (req.url === '/health') res.end('{}'); else res.writeHead(403).end(); });
  await assert.rejects(fixture.run('await manager.shutdownKbServer();', { KB_PORT: port, KB_MASTER_PASSWORD: 'wrong-password' }), /403/);
});

test('owned-only cleanup leaves a reused server running while explicit stop remains available', async t => {
  const fixture = await managerFixture(t);
  let shutdowns = 0;
  const port = await httpFixture(t, (req, res) => {
    if (req.url === '/shutdown') shutdowns++;
    res.end('{}');
  });
  await fixture.run('await manager.ensureKbServer(); await manager.shutdownKbServer({ ownedOnly: true });', { KB_PORT: port, KB_MASTER_PASSWORD: 'explicit-master' });
  assert.equal(shutdowns, 0, 'session cleanup must not stop a server it reused');
  await fixture.run('await manager.shutdownKbServer();', { KB_PORT: port, KB_MASTER_PASSWORD: 'explicit-master' });
  assert.equal(shutdowns, 1, 'the explicit stop operation must still reach the service');
});

test('API-key-only access to an existing service does not create a local management credential', async t => {
  const fixture = await managerFixture(t);
  const port = await httpFixture(t, (req, res) => {
    if (req.url === '/health') { res.end('{}'); return; }
    if (req.headers['x-api-key'] !== 'external-key') { res.writeHead(403).end('{}'); return; }
    res.end('[{"id":"external-record"}]');
  });
  const overrides = { KB_PORT: port, KB_API_KEY: 'external-key' };
  const { stdout } = await fixture.run('console.log(JSON.stringify(manager.getKbCredentials()));', overrides);
  assert.deepEqual(JSON.parse(stdout), { apiKey: 'external-key' });
  const result = await execute(process.execPath, [cli, 'kb', 'list'], { env: { ...fixture.env, ...overrides } });
  assert.deepEqual(JSON.parse(result.stdout), [{ id: 'external-record' }]);
  assert.deepEqual(await readdir(fixture.dir), ['manager.mjs'], 'read access must not create or modify local credential storage');
});

for (const command of [['kb', 'list'], ['kb', 'search', 'decision']]) {
  for (const [variable, header] of [['KB_API_KEY', 'x-api-key'], ['KB_MASTER_PASSWORD', 'x-master-password']]) {
    test(`${command.join(' ')} authenticates with ${variable}`, async t => {
      const port = await httpFixture(t, (req, res) => {
        if (req.url === '/health') { res.end('{}'); return; }
        if (req.headers[header] !== 'test-credential') { res.writeHead(403).end('{"error":"forbidden"}'); return; }
        res.end('[{"id":"authorized-record"}]');
      });
      const env = { ...process.env, KB_PORT: port, [variable]: 'test-credential' };
      if (variable === 'KB_API_KEY') delete env.KB_MASTER_PASSWORD;
      else delete env.KB_API_KEY;
      const { stdout } = await execute(process.execPath, [cli, ...command], { env });
      assert.deepEqual(JSON.parse(stdout), [{ id: 'authorized-record' }]);
    });
  }
}

test('kb list exits nonzero on rejected credentials', async t => {
  const port = await httpFixture(t, (req, res) => { if (req.url === '/health') res.end('{}'); else res.writeHead(403).end('{"error":"forbidden"}'); });
  await assert.rejects(execute(process.execPath, [cli, 'kb', 'list'], { env: { ...process.env, KB_PORT: port, KB_API_KEY: 'wrong-key' } }));
});
