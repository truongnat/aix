import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PhaseMachine, ValidationError } from '../dist/index.js';

const state = (phase) => ({ id: 's', task: 't', mode: 'guardrail', phase, createdAt: '', evidence: [] });

test('rewind moves to an earlier phase and records a decision', () => {
  const next = new PhaseMachine().rewind(state('run'), 'plan', 'revise');
  assert.equal(next.phase, 'plan');
  assert.equal(next.evidence.at(-1).kind, 'decision');
});

test('rewind rejects forward or same-phase targets', () => {
  const m = new PhaseMachine();
  assert.throws(() => m.rewind(state('discuss'), 'plan', 'x'), ValidationError);
  assert.throws(() => m.rewind(state('discuss'), 'discuss', 'x'), ValidationError);
  assert.throws(() => m.rewind(state('start'), 'verify', 'x'), ValidationError);
});

test('canAdvanceTo only allows the immediate next phase', () => {
  const m = new PhaseMachine();
  assert.equal(m.canAdvanceTo('start', 'discuss'), true);
  assert.equal(m.canAdvanceTo('verify', 'remember'), true);
  assert.equal(m.canAdvanceTo('start', 'plan'), false);
  assert.equal(m.canAdvanceTo('plan', 'plan'), false);
  assert.equal(m.canAdvanceTo('plan', 'discuss'), false);
  assert.equal(m.canAdvanceTo('remember', 'start'), false);
});
