import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

// Import the built module to run tests against and inject mock methods
import { handleGitCheckIfDirty, setClackPrompts, setExecSync } from '../dist/index.js';

let selectReturnValue = 'proceed';
const mockPrompts = {
  select: async () => selectReturnValue,
  note: () => {},
  spinner: () => ({
    start: () => {},
    stop: () => {},
  }),
  isCancel: (val) => val === 'cancel',
  log: {
    warn: () => {},
    success: () => {},
    error: () => {},
  }
};

// Inject the mock clack prompts
setClackPrompts(mockPrompts);

let mockGitStatus = '';
let mockGitDiff = '';
let mockIsGitRepo = true;
let mockStashCallback = () => {};

// Define the mock execSync function returning strings to support .trim()
const mockExecSync = (cmd, opts) => {
  if (cmd.includes('rev-parse')) {
    if (!mockIsGitRepo) throw new Error('not a git repo');
    return 'true';
  }
  if (cmd.includes('status')) {
    return mockGitStatus;
  }
  if (cmd.includes('diff')) {
    return mockGitDiff;
  }
  if (cmd.includes('stash')) {
    mockStashCallback();
    return 'Saved working directory';
  }
  return '';
};

// Inject the mock execSync
setExecSync(mockExecSync);

test('handleGitCheckIfDirty returns proceed when not in a git repo', async () => {
  mockIsGitRepo = false;
  const result = await handleGitCheckIfDirty();
  assert.equal(result, 'proceed');
});

test('handleGitCheckIfDirty returns proceed when git status is clean', async () => {
  mockIsGitRepo = true;
  mockGitStatus = '';
  const result = await handleGitCheckIfDirty();
  assert.equal(result, 'proceed');
});

test('handleGitCheckIfDirty prompts user and returns proceed when dirty and user chooses proceed', async () => {
  mockIsGitRepo = true;
  mockGitStatus = ' M src/index.ts';
  mockGitDiff = 'diff --git a/src/index.ts b/src/index.ts';
  
  selectReturnValue = 'proceed';

  const result = await handleGitCheckIfDirty();
  assert.equal(result, 'proceed');
});

test('handleGitCheckIfDirty prompts user, runs git stash, and returns proceed when user chooses stash', async () => {
  mockIsGitRepo = true;
  mockGitStatus = ' M src/index.ts';
  mockGitDiff = 'diff --git a/src/index.ts b/src/index.ts';

  selectReturnValue = 'stash';

  let executedStash = false;
  mockStashCallback = () => {
    executedStash = true;
  };

  const result = await handleGitCheckIfDirty();
  assert.equal(result, 'proceed');
  assert.equal(executedStash, true);
});

test('handleGitCheckIfDirty returns cancel when user chooses cancel', async () => {
  mockIsGitRepo = true;
  mockGitStatus = ' M src/index.ts';
  mockGitDiff = 'diff --git a/src/index.ts b/src/index.ts';

  selectReturnValue = 'cancel';

  const result = await handleGitCheckIfDirty();
  assert.equal(result, 'cancel');
});
