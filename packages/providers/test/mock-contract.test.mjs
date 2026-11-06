import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProvider } from '../dist/index.js';

test('Mock returns valid JSON across the discuss → plan → coder contract', async () => {
  const mock = createProvider({ AIX_PROVIDER: 'mock' });
  const discussion = JSON.parse((await mock.call({ system: 'Respond with valid JSON: {"goal":"", "constraints":[], "options":[], "recommendation":"", "rationale":""}', user: 'Task: Create todo CLI' })).content);
  assert.equal(typeof discussion.goal, 'string');
  assert.ok(Array.isArray(discussion.options));

  const plan = JSON.parse((await mock.call({ system: 'Respond with valid JSON: {"goal":"", "tasks":[]}', user: 'Task: Create todo CLI' })).content);
  assert.ok(plan.tasks.length > 0);
  assert.equal(typeof plan.tasks[0].id, 'string');
  assert.ok(plan.tasks[0].files.length > 0);
  assert.ok(plan.tasks[0].acceptanceCriteria.length > 0);

  const paths = ['package.json', 'src/cli.js', 'README.md'];
  const response = JSON.parse((await mock.call({ system: 'Return only valid JSON: {"files":[{"path":"exact/declared/path","content":"complete file contents"}]}', user: `Task ID: task-1\nDeclared file targets: ${JSON.stringify(paths)}` })).content);
  assert.deepEqual(response.files.map(f => f.path), paths);
  assert.ok(response.files.every(f => typeof f.content === 'string' && f.content.length > 0));
});
