import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EngineGraph, createInitialEngineState } from '@x/engine';
import { createDefaultBudgetState } from '@x/core';

// These tests run against the built dist (node --test, zero extra deps).
// They exercise the autonomous graph end-to-end in mock mode (no API key).

function makeSession(id) {
  return {
    id,
    task: 'write an add(a, b) function that returns the sum',
    mode: 'autonomous',
    phase: 'run',
    createdAt: new Date().toISOString(),
    evidence: [],
    budget: createDefaultBudgetState(10),
  };
}

function runMock(id) {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const initial = createInitialEngineState(makeSession(id));
  return new EngineGraph().run(initial);
}

test('EngineGraph.run completes without throwing (no node-name collision)', async () => {
  const final = await runMock(`smoke-${Date.now()}`);
  assert.ok(final, 'run returned a state');
  assert.equal(typeof final.reviewScore, 'number', 'reviewScore is a number');
});

test('T1: coder writes at least one artefact to disk', async () => {
  const final = await runMock(`files-${Date.now()}`);
  assert.ok(Array.isArray(final.writtenFiles), 'writtenFiles is an array');
  assert.ok(final.writtenFiles.length > 0, 'at least one file written');
  assert.ok(
    final.writtenFiles.every(f => f.startsWith('.aix/generated/')),
    'all writes confined to the sandbox',
  );
});

test('T2: budget is wired — usdSpent increases after a run', async () => {
  const final = await runMock(`budget-${Date.now()}`);
  assert.ok(
    final.session.budget.usdSpent > 0,
    `usdSpent should be > 0 after coder runs, got ${final.session.budget.usdSpent}`,
  );
});
