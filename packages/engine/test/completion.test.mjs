import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const engineUrl = new URL('../dist/index.js', import.meta.url).href;
const coreUrl = new URL('../../core/dist/index.js', import.meta.url).href;

test('generation visits every planned task without claiming verification from a text score', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'aix-completion-'));
  try {
    const script = `
      import { EngineGraph, createInitialEngineState } from ${JSON.stringify(engineUrl)};
      import { GuardrailLoop } from ${JSON.stringify(coreUrl)};
      const session = { ...await new GuardrailLoop().createSession('implement four functions'), mode: 'autonomous' };
      const initial = { ...createInitialEngineState(session),
        discussion: { goal: 'four functions', constraints: [], options: [], recommendation: '', rationale: '' },
        plan: { goal: 'four functions', steps: ['implement alpha function', 'implement beta function', 'implement gamma function', 'implement delta function'] }
      };
      const final = await new EngineGraph().run(initial);
      console.log('FINAL_STATE=' + JSON.stringify(final));
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, ANTHROPIC_API_KEY: '', OPENAI_API_KEY: '', GROQ_API_KEY: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    const line = result.stdout.split('\n').find(l => l.startsWith('FINAL_STATE='));
    assert.ok(line, result.stdout);
    const final = JSON.parse(line.slice('FINAL_STATE='.length));
    assert.deepEqual(final.tasks.map(t => t.status), ['done', 'done', 'done', 'done']);
    assert.equal(final.verification, undefined, 'generating output must not invent executable verification');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('a plan created during execution is not truncated by the pre-plan recursion default', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'aix-long-plan-'));
  try {
    const script = `
      import { EngineGraph, createInitialEngineState } from ${JSON.stringify(engineUrl)};
      import { GuardrailLoop } from ${JSON.stringify(coreUrl)};
      let calls = 0;
      globalThis.fetch = async () => {
        calls++;
        const content = calls === 1
          ? JSON.stringify({goal:'twelve functions',constraints:[],options:[],recommendation:'',rationale:''})
          : calls === 2
            ? JSON.stringify({goal:'twelve functions',tasks:Array.from({length:12},(_,i)=>({title:'implement function item '+i}))})
            : 'export const answer = 42;';
        return new Response(JSON.stringify({choices:[{message:{content}}],usage:{prompt_tokens:10,completion_tokens:10}}),{status:200});
      };
      const session = {...await new GuardrailLoop().createSession('implement twelve functions'),mode:'autonomous'};
      const final = await new EngineGraph().run(createInitialEngineState(session));
      console.log('TASK_STATUS='+JSON.stringify(final.tasks.map(task=>task.status)));
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, ANTHROPIC_API_KEY: undefined, GROQ_API_KEY: undefined, OPENAI_API_KEY: 'fixture-only', AIX_PROVIDER: 'openai' },
    });
    assert.equal(result.status, 0, result.stderr);
    const line = result.stdout.split('\n').find(value => value.startsWith('TASK_STATUS='));
    assert.ok(line, result.stdout);
    assert.deepEqual(JSON.parse(line.slice('TASK_STATUS='.length)), Array(12).fill('done'));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
