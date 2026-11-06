import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createDefaultBudgetState } from '@x/core';
import { coderNode, discussNode, planNode, tasksNode, pickNode, ticketPlanNode, createInitialEngineState, sessionGeneratedDir, sessionArtifactPath } from '../dist/index.js';

async function setup(t, response) {
  const temp = await mkdtemp(join(tmpdir(), 'aix-generation-contract-'));
  const before = { ...process.env };
  Object.assign(process.env, { AIX_SESSIONS_ROOT: temp, AIX_PROVIDER: 'openai', AIX_API_KEY: 'fixture-key', AIX_API_URL: 'http://127.0.0.1:9876/v1/chat/completions' });
  const session = { id: randomUUID(), task: 'Create a Node.js todo CLI', mode: 'autonomous', phase: 'run', createdAt: new Date().toISOString(), evidence: [], budget: createDefaultBudgetState(10) };
  const root = sessionGeneratedDir(session.id);
  t.after(async () => {
    for (const key of ['AIX_SESSIONS_ROOT', 'AIX_PROVIDER', 'AIX_API_KEY', 'AIX_API_URL']) {
      if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key];
    }
    await rm(temp, { recursive: true, force: true });
  });
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    const content = typeof response === 'function' ? response(request) : response;
    return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
  });
  const current = { id: 'task-1', description: 'Create the command package', status: 'in-progress' };
  const planned = { id: current.id, title: 'Create the command package', description: current.description, dependencies: [], files: ['package.json', 'bin/todo.js'], acceptanceCriteria: ['node bin/todo.js --help works'] };
  const state = { ...createInitialEngineState(session), current, tasks: [current], plan: { goal: session.task, steps: [planned.title], tasks: [planned] }, ticketPlans: [{ ticketId: 'ticket-task-1', description: current.description, dependencies: [], files: planned.files, acceptanceCriteria: planned.acceptanceCriteria }] };
  return { state, root, temp, requests };
}

function plannedTask(id, overrides = {}) {
  return { id, title: `Title ${id}`, description: 'Shared description', dependencies: [], files: [`lib/${id}.py`], acceptanceCriteria: [`${id} works`], ...overrides };
}

test('coder rejects prose or requests for workspace tools instead of marking it as generated source', async (t) => {
  const { state, root } = await setup(t, 'I do not have workspace tools. Please paste package.json.');
  await assert.rejects(coderNode(state), /json|file|source|response/i);
  assert.equal(existsSync(root), false);
});

test('coder writes every declared file with decoded content, rather than one file containing the JSON wrapper', async (t) => {
  const pkg = '{"name":"todo","type":"module","bin":{"todo":"bin/todo.js"}}\n';
  const cli = '#!/usr/bin/env node\nconsole.log("todo add | list | done | remove");\n';
  const { state, root } = await setup(t, JSON.stringify({ files: [{ path: 'package.json', content: pkg }, { path: 'bin/todo.js', content: cli }] }));
  const result = await coderNode(state);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), pkg);
  assert.equal(await readFile(join(root, 'bin/todo.js'), 'utf8'), cli);
  assert.equal(result.tasks[0].status, 'done');
  assert.deepEqual(result.writtenFiles.slice().sort(), [join(root, 'package.json'), join(root, 'bin/todo.js')].sort());
});

for (const [label, response] of [
  ['empty', { goal: 'Create CLI', tasks: [] }],
  ['bare steps', { goal: 'Create CLI', steps: ['Write CLI'] }],
  ['missing metadata', { goal: 'Create CLI', tasks: [{ title: 'Write CLI' }] }],
  ['unknown dependency', { goal: 'Create CLI', tasks: [plannedTask('one', { dependencies: ['missing'] })] }],
  ['self dependency', { goal: 'Create CLI', tasks: [plannedTask('one', { dependencies: ['one'] })] }],
  ['cycle', { goal: 'Create CLI', tasks: [plannedTask('one', { dependencies: ['two'] }), plannedTask('two', { dependencies: ['one'] })] }],
  ['duplicate ids', { goal: 'Create CLI', tasks: [plannedTask('one'), plannedTask('one')] }],
  ['no targets', { goal: 'Create CLI', tasks: [plannedTask('one', { files: [] })] }],
  ['no acceptance criteria', { goal: 'Create CLI', tasks: [plannedTask('one', { acceptanceCriteria: [] })] }],
  ['duplicate targets', { goal: 'Create CLI', tasks: [plannedTask('one', { files: ['a.py', 'a.py'] })] }],
  ['unsafe target', { goal: 'Create CLI', tasks: [plannedTask('one', { files: ['../a.py'] })] }],
  ['malformed JSON', '{"goal":'],
  ['prose around JSON', 'Here is the plan: {"goal":"Create CLI","tasks":[]}'],
]) {
  test(`plan rejects ${label} instead of inventing executable work`, async (t) => {
    const { state } = await setup(t, typeof response === 'string' ? response : JSON.stringify(response));
    const { plan, ...withoutPlan } = state;
    await assert.rejects(planNode(withoutPlan), /task|plan|json|path/i);
    assert.equal(existsSync(sessionArtifactPath(state.session.id, 'PLAN.md')), false);
  });
}

test('fenced plans retain exact metadata and schedule dependencies before their dependents', async (t) => {
  const first = plannedTask('foundation', { files: ['lib/alice@example.com.py'] });
  const second = plannedTask('commands', { dependencies: ['foundation'], files: ['bin/tool.py', 'README.md'] });
  const definitions = [second, first];
  const { state } = await setup(t, `\n\`\`\`json\n${JSON.stringify({ goal: 'Python CLI', tasks: definitions })}\n\`\`\`\n`);
  const { plan, ...withoutPlan } = state;
  const planned = await planNode(withoutPlan);
  assert.deepEqual(planned.plan.tasks, definitions);
  assert.deepEqual(planned.plan.steps, definitions.map(task => task.title));
  const queued = await tasksNode(planned);
  assert.deepEqual(queued.tasks.map(({ id, description }) => ({ id, description })), definitions.map(({ id, description }) => ({ id, description })));
  const picked = await pickNode(queued);
  assert.equal(picked.current.id, first.id);
  const ticketed = await ticketPlanNode(picked);
  assert.deepEqual(ticketed.ticketPlans.at(-1), { ticketId: 'ticket-foundation', description: first.description, dependencies: first.dependencies, files: first.files, acceptanceCriteria: first.acceptanceCriteria });
  const completed = { ...ticketed, tasks: ticketed.tasks.map(task => task.id === first.id ? { ...task, status: 'done' } : task) };
  const next = await pickNode(completed);
  assert.equal(next.current.id, second.id);
  const nextTicket = await ticketPlanNode(next);
  assert.deepEqual(nextTicket.ticketPlans.at(-1).files, second.files);
  assert.deepEqual(nextTicket.ticketPlans.at(-1).dependencies, second.dependencies);
  assert.deepEqual(nextTicket.ticketPlans.at(-1).acceptanceCriteria, second.acceptanceCriteria);
  assert.equal((await ticketPlanNode(nextTicket)).ticketPlans.length, nextTicket.ticketPlans.length);
});

test('tasks refuses a legacy step-only plan and ticket generation refuses an unknown task id', async (t) => {
  const { state } = await setup(t, '');
  await assert.rejects(tasksNode({ ...state, plan: { goal: 'legacy', steps: ['write a UI'] } }), /task|plan/i);
  await assert.rejects(ticketPlanNode({ ...state, current: { ...state.current, id: 'unknown' } }), /task|plan/i);
});

test('pick fails visibly when dependencies failed and clears a stale current when no pending tasks remain', async (t) => {
  const { state } = await setup(t, '');
  const plan = { goal: 'CLI', steps: ['base', 'app'], tasks: [plannedTask('base'), plannedTask('app', { dependencies: ['base'] })] };
  const tasks = [{ id: 'base', description: 'base', status: 'failed' }, { id: 'app', description: 'app', status: 'pending' }];
  await assert.rejects(pickNode({ ...state, plan, tasks }), /depend|blocked/i);
  const result = await pickNode({ ...state, tasks: state.tasks.map(task => ({ ...task, status: 'done' })) });
  assert.equal(result.current, undefined);
});

for (const [label, files] of [
  ['empty files', []],
  ['missing target', [{ path: 'package.json', content: '{}' }]],
  ['undeclared target', [{ path: 'package.json', content: '{}' }, { path: 'other.js', content: 'code' }]],
  ['duplicate target', [{ path: 'package.json', content: '{}' }, { path: 'package.json', content: '{}' }]],
  ['empty content', [{ path: 'package.json', content: '{}' }, { path: 'bin/todo.js', content: ' \n' }]],
  ['non-string content', [{ path: 'package.json', content: '{}' }, { path: 'bin/todo.js', content: {} }]],
  ['parent traversal', [{ path: 'package.json', content: '{}' }, { path: '../escape.js', content: 'code' }]],
  ['absolute path', [{ path: 'package.json', content: '{}' }, { path: '/tmp/escape.js', content: 'code' }]],
  ['Windows absolute path', [{ path: 'package.json', content: '{}' }, { path: 'C:\\escape.js', content: 'code' }]],
  ['path alias', [{ path: 'package.json', content: '{}' }, { path: 'bin/../package.json', content: 'code' }]],
  ['secret in content', [{ path: 'package.json', content: '{}' }, { path: 'bin/todo.js', content: `const key = 'ghp_${'c'.repeat(36)}';` }]],
  ['secret in path', [{ path: 'package.json', content: '{}' }, { path: `ghp_${'c'.repeat(36)}.js`, content: 'code' }]],
]) {
  test(`coder rejects the full batch for ${label} without writes or done status`, async (t) => {
    const { state, root } = await setup(t, JSON.stringify({ files }));
    await assert.rejects(coderNode(state), /file|path|source|secret|target|content/i);
    assert.equal(existsSync(root), false);
    assert.equal(state.tasks[0].status, 'in-progress');
  });
}

for (const response of ['{"files":', '[]', 'null', '{"files":{}}']) {
  test(`coder rejects malformed response ${response}`, async (t) => {
    const { state, root } = await setup(t, response);
    await assert.rejects(coderNode(state), /json|response|file/i);
    assert.equal(existsSync(root), false);
  });
}

test('later tasks receive prior generated content and the exact task metadata despite identical descriptions', async (t) => {
  const { state, root, requests } = await setup(t, request => {
    const user = request.messages.find(message => message.role === 'user').content;
    return user.includes('Task ID: foundation')
      ? JSON.stringify({ files: [{ path: 'lib/base.py', content: 'def base():\n    return 42\n' }] })
      : `\`\`\`json\n${JSON.stringify({ files: [{ path: 'bin/app.py', content: 'from lib.base import base\nprint(base())\n' }, { path: 'README.md', content: 'Run python bin/app.py\n' }] })}\n\`\`\``;
  });
  const definitions = [plannedTask('foundation', { files: ['lib/base.py'] }), plannedTask('app', { dependencies: ['foundation'], files: ['bin/app.py', 'README.md'] })];
  const queued = await tasksNode({ ...state, plan: { goal: 'Python CLI', steps: definitions.map(task => task.title), tasks: definitions } });
  const first = await coderNode(await ticketPlanNode(await pickNode(queued)));
  const second = await coderNode(await ticketPlanNode(await pickNode(first)));
  const request = requests.at(-1).messages.find(message => message.role === 'user').content;
  assert.match(request, /lib\/base\.py/);
  assert.ok(request.includes('def base():\\n    return 42\\n') || request.includes('def base():\n    return 42\n'));
  assert.match(request, /foundation/);
  assert.match(request, /app works/);
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), 'Run python bin/app.py\n');
  assert.deepEqual(second.tasks.map(task => task.status), ['done', 'done']);
  assert.equal(requests[0].messages[0].content.includes('TypeScript'), false);
});

test('coder validates directory conflicts across the batch before creating any target', async (t) => {
  const { state, root } = await setup(t, JSON.stringify({ files: [{ path: 'lib', content: 'file' }, { path: 'lib/app.py', content: 'print(1)' }] }));
  state.plan.tasks[0].files = ['lib', 'lib/app.py'];
  await assert.rejects(coderNode(state), /file|directory|path|target/i);
  assert.equal(existsSync(root), false);
});

test('coder rejects a symlink target in the batch before writing an earlier valid file', async (t) => {
  const { state, root, temp } = await setup(t, JSON.stringify({ files: [{ path: 'package.json', content: '{}' }, { path: 'bin/todo.js', content: 'print(1)' }] }));
  const outside = join(temp, 'outside');
  await mkdir(outside);
  await mkdir(root, { recursive: true });
  await symlink(outside, join(root, 'bin'), 'dir');
  await assert.rejects(coderNode(state), /symlink|sandbox|path/i);
  assert.equal(existsSync(join(root, 'package.json')), false);
  assert.equal(existsSync(join(outside, 'todo.js')), false);
});

test('coder rejects an existing directory as a file before writing any batch file', async (t) => {
  const { state, root } = await setup(t, JSON.stringify({ files: [{ path: 'package.json', content: '{}' }, { path: 'bin/todo.js', content: 'print(1)' }] }));
  await mkdir(join(root, 'bin/todo.js'), { recursive: true });
  await assert.rejects(coderNode(state), /file|directory|path/i);
  assert.equal(existsSync(join(root, 'package.json')), false);
  assert.equal(state.current.status, 'in-progress');
});

test('coder refuses outside-sandbox context and missing previously generated files', async (t) => {
  const { state, root, temp, requests } = await setup(t, '');
  const outside = join(temp, 'private.py');
  await writeFile(outside, 'private context');
  await assert.rejects(coderNode({ ...state, writtenFiles: [outside] }), /sandbox|path/i);
  await assert.rejects(coderNode({ ...state, writtenFiles: [join(root, 'missing.py')] }), /ENOENT|file/i);
  assert.equal(requests.length, 0);
});

test('discussion accepts fenced JSON and rejects malformed output without writing an invented discussion', async (t) => {
  const discussion = { goal: 'Python CLI', constraints: [], options: [], recommendation: '', rationale: 'Keep storage local.' };
  const { state } = await setup(t, `\`\`\`json\n${JSON.stringify(discussion)}\n\`\`\``);
  assert.deepEqual((await discussNode(state)).discussion, discussion);
});

test('discussion rejects malformed output without writing an invented discussion', async (t) => {
  const { state } = await setup(t, 'Please provide tools.');
  await assert.rejects(discussNode(state), /json|discussion|response/i);
  assert.equal(existsSync(sessionArtifactPath(state.session.id, 'DISCUSSION.md')), false);
});
