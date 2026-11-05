import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const moduleUrl = new URL('../dist/index.js', import.meta.url).href;

function decision(t, tier = 0) {
  const code = `import { ConsoleHitlChannel } from ${JSON.stringify(moduleUrl)};
    try {
      const result = await new ConsoleHitlChannel().ask({ question: 'Approve?', tier: ${tier}, options: [
        { id: 'approve', label: 'Approve', summary: 'Authorize' },
        { id: 'reject', label: 'Reject', summary: 'Do not authorize' }
      ] });
      console.log('RESULT:' + JSON.stringify(result));
    } catch (error) { console.error('ABORT:' + error.message); process.exitCode = 2; }`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  const watchers = new Set();
  child.stdout.on('data', data => { stdout += data; for (const notify of watchers) notify(); });
  child.stderr.on('data', data => { stderr += data; });
  child.stdin.on('error', () => {});
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
  t.after(() => { child.stdin.destroy(); child.kill(); });
  function until(text) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { watchers.delete(check); reject(new Error(`Missing prompt ${text}: ${stdout}\n${stderr}`)); }, 4000);
      function check() { if (stdout.includes(text)) { clearTimeout(timer); watchers.delete(check); resolve(stdout); } }
      watchers.add(check);
      check();
    });
  }
  return { child, done, until };
}

for (const answer of ['0', '3', '-1', '1garbage', '1.5', '2e0', 'NaN', 'garbage', '', ' ']) {
  test(`terminal input ${JSON.stringify(answer)} aborts rather than authorizes`, { timeout: 6000 }, async t => {
    const run = decision(t);
    await run.until('or select in browser: ');
    run.child.stdin.end(`${answer}\n`);
    const result = await run.done;
    assert.equal(result.code, 2, JSON.stringify(result));
    assert.match(result.stderr, /ABORT:/);
    assert.doesNotMatch(result.stdout, /RESULT:/);
  });
}

test('terminal EOF while selecting aborts promptly', { timeout: 6000 }, async t => {
  const run = decision(t);
  await run.until('or select in browser: ');
  run.child.stdin.end();
  const result = await run.done;
  assert.equal(result.code, 2, JSON.stringify(result));
  assert.match(result.stderr, /ABORT:/);
  assert.doesNotMatch(result.stdout, /RESULT:/);
});

test('terminal EOF while collecting a note does not authorize', { timeout: 6000 }, async t => {
  const run = decision(t);
  await run.until('or select in browser: ');
  run.child.stdin.write('1\n');
  await run.until('Note (optional');
  run.child.stdin.end();
  const result = await run.done;
  assert.equal(result.code, 2, JSON.stringify(result));
  assert.doesNotMatch(result.stdout, /RESULT:/);
});

test('valid terminal selection preserves the chosen option and note', { timeout: 6000 }, async t => {
  const run = decision(t);
  await run.until('or select in browser: ');
  run.child.stdin.write('2\n');
  await run.until('Note (optional');
  run.child.stdin.write(' keep rejected \n');
  const result = await run.done;
  assert.equal(result.code, 0, JSON.stringify(result));
  assert.match(result.stdout, /RESULT:\{"chosen":"reject","note":"keep rejected"\}/);
});

test('browser selection resolves and closes pending terminal input', { timeout: 8000 }, async t => {
  const run = decision(t, 1);
  const stdout = await run.until('or select in browser: ');
  const url = stdout.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
  assert.ok(url, stdout);
  const response = await fetch(`${url}/choose?id=reject`);
  assert.equal(response.status, 200);
  await response.text();
  const result = await run.done;
  assert.equal(result.code, 0, JSON.stringify(result));
  assert.match(result.stdout, /RESULT:\{"chosen":"reject","note":"Selected via web preview panel"\}/);
});
