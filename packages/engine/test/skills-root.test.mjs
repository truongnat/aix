import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createDefaultBudgetState } from '@x/core';
import { discussNode, planNode, createInitialEngineState } from '../dist/index.js';

const engineUrl = new URL('../dist/index.js', import.meta.url).href;

test('nested desktop launch finds repository skills without an environment override', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e',
    `import {resolveSkillsRoot} from ${JSON.stringify(engineUrl)}; console.log(resolveSkillsRoot());`], {
    cwd: new URL('../../../apps/desktop/', import.meta.url),
    env: { ...process.env, AIX_CONTENT_ROOT: '' }, encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), new URL('../../../skills/', import.meta.url).pathname.replace(/\/$/, ''));
});

test('Discuss and Plan load the skill root set after module import into their actual prompts', async t => {
  const root = await mkdtemp(join(tmpdir(), 'aix-late-skills-'));
  const names = ['AIX_CONTENT_ROOT', 'AIX_SESSIONS_ROOT', 'AIX_PROVIDER', 'AIX_API_KEY', 'AIX_API_URL'];
  const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
  t.after(async () => {
    for (const name of names) {
      if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name];
    }
    await rm(root, { recursive: true, force: true });
  });
  for (const [name, marker] of [['discussing-pro', 'DISCUSS_LATE_SKILL'], ['planning-pro', 'PLAN_LATE_SKILL']]) {
    const dir = join(root, 'skills', 'methodology', name);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: Fixture instructions\nx-kind: process\n---\n${marker}\n`);
  }
  Object.assign(process.env, { AIX_CONTENT_ROOT: join(root, 'skills'), AIX_SESSIONS_ROOT: join(root, 'sessions'), AIX_PROVIDER: 'openai', AIX_API_KEY: 'fixture-only', AIX_API_URL: 'http://127.0.0.1:9876/v1/chat/completions' });
  const prompts = [];
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    const body = JSON.parse(init.body);
    const prompt = body.messages[0].content;
    prompts.push(prompt);
    const content = prompt.includes('engineering analyst')
      ? { goal: 'Demo project', constraints: [], options: [], recommendation: '', rationale: 'Demo' }
      : { goal: 'Demo project', tasks: [{ id: 'one', title: 'Write readme', description: 'Document the project', dependencies: [], files: ['README.md'], acceptanceCriteria: ['Documents usage'] }] };
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }));
  });
  const initial = createInitialEngineState({ id: randomUUID(), task: 'Demo project', mode: 'autonomous', phase: 'discuss', createdAt: new Date().toISOString(), evidence: [], budget: createDefaultBudgetState(10) });
  await planNode(await discussNode(initial));
  assert.match(prompts[0], /DISCUSS_LATE_SKILL/);
  assert.match(prompts[1], /PLAN_LATE_SKILL/);
});
