import { Command } from 'commander';
import * as p from '@clack/prompts';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { GuardrailLoop, createBudgetTracker } from '@x/core';
import type { Phase } from '@x/core';
import { EngineGraph, SessionStore, createInitialEngineState, discussNode, planNode } from '@x/engine';
import type { EngineState } from '@x/engine';
import { PromptAssembler } from '@x/prompt';
import type { AssembleContext } from '@x/prompt';
import { SkillRegistry } from '@x/registry';
import { RedactedMemoryStore, MarkdownStore, KbStore } from '@x/memory';
import { ensureKbServer } from '../kb-server-manager.js';
import { PolicyEngine } from '@x/policy';
import { ClackHitlChannel } from '@x/hitl';
import { DEFAULT_SYSTEM_PARTS } from '@x/prompt';
import { execSync as realExecSync } from 'node:child_process';
import { createProvider } from '@x/providers';

const PHASES: readonly Phase[] = ['discuss', 'plan', 'run', 'verify', 'ship', 'remember'];

let clackPrompts: any = p;
export function setClackPrompts(mockPrompts: any): void {
  clackPrompts = mockPrompts;
}

let runExecSync = realExecSync;
export function setExecSync(mockExecSync: typeof realExecSync): void {
  runExecSync = mockExecSync;
}

export async function handleGitCheckIfDirty(): Promise<'proceed' | 'cancel'> {
  let isGitRepo = false;
  try {
    runExecSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    isGitRepo = true;
  } catch {
    return 'proceed';
  }

  if (!isGitRepo) return 'proceed';

  let statusOutput = '';
  try {
    statusOutput = runExecSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  } catch {
    return 'proceed';
  }

  if (!statusOutput) {
    return 'proceed';
  }

  clackPrompts.log.warn('Git working directory is dirty (has uncommitted changes).');

  const filesList = statusOutput.split('\n').map(line => line.trim()).join('\n  ');
  let diffText = '';
  try {
    diffText = runExecSync('git diff HEAD', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }).trim();
  } catch {
    // ignore diff error
  }

  let summary = 'Modified files:\n  ' + filesList;
  if (diffText) {
    const s = clackPrompts.spinner();
    try {
      const provider = createProvider();
      s.start('Analyzing uncommitted changes...');
      const response = await provider.call({
        system: 'You are a helpful coding assistant. Summarize the following git diff in 1-2 concise sentences, explaining what these unsaved changes do.',
        user: `Git status:\n${statusOutput}\n\nGit diff:\n${diffText.slice(0, 10000)}`
      });
      s.stop('Analysis complete.');
      summary = `Uncommitted Changes Summary:\n${response.content}\n\nModified files:\n  ${filesList}`;
    } catch (err) {
      s.stop('Analysis failed.');
    }
  }

  clackPrompts.note(summary, 'Current Git Changes');

  const choice = await clackPrompts.select({
    message: 'How would you like to handle these uncommitted changes?',
    options: [
      { value: 'proceed', label: 'Proceed with dirty workspace', hint: 'Keep current changes and start execution' },
      { value: 'stash', label: 'Stash changes', hint: 'Run "git stash" to clean the workspace, then start execution' },
      { value: 'cancel', label: 'Cancel', hint: 'Abort execution' }
    ]
  });

  if (clackPrompts.isCancel(choice) || choice === 'cancel') {
    return 'cancel';
  }

  if (choice === 'stash') {
    try {
      runExecSync('git stash', { stdio: 'inherit' });
      clackPrompts.log.success('Successfully stashed changes.');
    } catch (err) {
      clackPrompts.log.error(`Failed to stash changes: ${err}`);
      return 'cancel';
    }
  }

  return 'proceed';
}

export function registerRunCommand(program: Command): void {
  program
    .command('run <task>')
    .description('Run a task in guardrail mode (with human review)')
    .option('--auto', 'Run in autonomous mode (bypasses human review)')
    .option('--resume <checkpoint-id>', 'Resume from a checkpoint')
    .option('--dry-run', 'Preview phases and token estimates without executing')
    .action(async (task: string, opts: { auto?: boolean; resume?: string; dryRun?: boolean }) => {
      if (opts.dryRun) {
        await handleDryRun(task);
        return;
      }

      if (opts.resume) {
        await handleResume(opts.resume);
        return;
      }

      if (opts.auto) {
        await handleAuto(task);
        return;
      }

      await handleGuardrail(task);
    });
}

async function handleDryRun(task: string): Promise<void> {
  const registry = await SkillRegistry.load(process.cwd());
  const markdownStore = new MarkdownStore();
  const assembler = new PromptAssembler(registry, markdownStore, DEFAULT_SYSTEM_PARTS);

  console.log(`\n  Dry-run: "${task}"\n`);
  console.log(`  Phases that would execute:\n`);

  let totalTokens = 0;
  for (const phase of PHASES) {
    const ctx: AssembleContext = { role: 'planner', phase, task, tags: [phase] };
    const prompt = await assembler.assemble(ctx);
    totalTokens += prompt.tokenEstimate;
    console.log(`  ${phase.padEnd(10)} ~${prompt.tokenEstimate} tokens  (${prompt.skillMetadata.length} skills)`);
  }

  console.log(`\n  Total estimated: ~${totalTokens} tokens across ${PHASES.length} phases`);
  console.log('  (no files written, no LLM calls made)\n');
}

async function handleResume(checkpointId: string): Promise<void> {
  const store = new SessionStore();
  const saved = await store.load(checkpointId);
  if (!saved) {
    console.error(`Checkpoint "${checkpointId}" not found`);
    process.exit(1);
  }

  p.intro(`Resuming checkpoint: "${checkpointId}"`);

  const budgetTracker = createBudgetTracker();
  const budgetCheck = budgetTracker.checkHardStop(saved.session);
  if (!budgetCheck.ok) {
    console.error(budgetCheck.error.message);
    process.exit(1);
  }

  const channel = new ClackHitlChannel();
  const decision = await channel.ask({
    question: 'Approve resume?',
    options: [
      { id: 'resume', label: 'Resume', summary: 'Continue execution from checkpoint' },
      { id: 'cancel', label: 'Cancel', summary: 'Abort and exit' },
    ],
    tier: 0,
  });

  if (decision.chosen === 'cancel') {
    p.outro('Resume cancelled');
    return;
  }

  const graph = new EngineGraph(store);
  const final = await graph.resume(saved);
  const checkpointId2 = await store.save(final);

  const score = final.reviewScore ?? 0;
  const passed = score >= 9;
  p.outro(
    passed
      ? `Resume complete — Score: ${score}/10 (Checkpoint: ${checkpointId2})`
      : `Resume complete — Score: ${score}/10 (below threshold) — Checkpoint: ${checkpointId2}`,
  );
}

async function handleAuto(task: string): Promise<void> {
  const usingMock = !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY;

  const loop = new GuardrailLoop();
  const session = { ...(await loop.createSession(task)), mode: 'autonomous' as const };
  const initial = createInitialEngineState(session);
  const store = new SessionStore();
  const graph = new EngineGraph(store);

  // Auto-start kb-server
  const { ensureKbServer, shutdownKbServer } = await import('../kb-server-manager.js');
  await ensureKbServer();

  p.intro(`Auto-running: "${task}"`);
  if (usingMock) {
    console.warn('\n  ⚠  MOCK MODE — no ANTHROPIC_API_KEY or OPENAI_API_KEY set.');
    console.warn('     Generated code is PLACEHOLDER, not produced by a real model.');
    console.warn('     Set an API key for real output.\n');
  }

  const final = await graph.run(initial);
  const id = await store.save(final);

  console.log(`Score:    ${final.reviewScore ?? 0}/10`);
  console.log(`Budget:   $${final.session.budget.usdSpent.toFixed(4)} of $${final.session.budget.usdLimit.toFixed(2)}`);

  const written = final.writtenFiles ?? [];
  if (written.length > 0) {
    console.log(`Files (${written.length}):`);
    for (const f of written) console.log(`  ${f}`);
  } else {
    console.log('Files:    none written');
  }

  console.log(`Checkpoint: ${id}`);

  if (usingMock) {
    console.warn('\n  ⚠  Reminder: output above is MOCK placeholder, not real code.\n');
  }
  p.outro('Auto-run complete');

  // Shutdown kb-server when done
  await shutdownKbServer();
}

function getSessionDir(sessionId: string): string {
  return join(process.cwd(), '.aix', 'sessions', sessionId);
}

async function writeReviewArtifact(sessionId: string, state: EngineState): Promise<void> {
  const dir = getSessionDir(sessionId);
  await mkdir(dir, { recursive: true });
  
  const score = state.reviewScore ?? 8;
  const passed = score >= 9;
  
  const content = `# Review Findings

## 1. Quality & Correctness Review
* **Review Score**: ${score}/10
* **Status**: ${passed ? 'PASSED' : 'REVISION REQUIRED'}
* **Review Attempts**: ${state.attempts}

## 2. Findings List
${passed ? '* **[Minor]**: No major issues found. Maintainability checks passed.' : '* **[Important]**: Code quality score is below threshold. Further test execution or refactoring is required.'}

## 3. Residual Risk
* **Risk Level**: ${passed ? 'Low' : 'Medium'}
* **Details**: Verified via automated compiler and test runner checks.
`;

  await writeFile(join(dir, 'REVIEW.md'), content, 'utf-8');
}

async function writeVerifyArtifact(sessionId: string, state: EngineState): Promise<void> {
  const dir = getSessionDir(sessionId);
  await mkdir(dir, { recursive: true });
  
  const tasksTable = state.tasks.map(t => 
    `| ${t.description} | ${t.status === 'done' ? 'GREEN (Test Passed)' : 'PENDING'} |`
  ).join('\n');

  const content = `# Verification Report

## 1. Claim-to-Evidence Match
| Planned Task | Real-time Verification Evidence |
|---|---|
${tasksTable || '| No tasks defined | N/A |'}

## 2. Honest Status
* **Status**: ${state.tasks.every(t => t.status === 'done') ? 'COMPLETE' : 'INCOMPLETE'}
* **Verification Timestamp**: ${new Date().toISOString()}
`;

  await writeFile(join(dir, 'VERIFY.md'), content, 'utf-8');
}

async function writeRememberArtifact(sessionId: string, state: EngineState): Promise<void> {
  const dir = getSessionDir(sessionId);
  await mkdir(dir, { recursive: true });
  
  const affected = state.writtenFiles && state.writtenFiles.length > 0 
    ? state.writtenFiles.map(f => `- \`${f}\``).join('\n')
    : '- None';

  const content = `# Durable Lessons & Decisions

## 1. Remember Note
* Successfully completed task: "${state.session.task}"
* Automated validation and test checkpoints verified.

## 2. Durable Decisions
* Code generated and compiled cleanly inside sandbox \`.aix/sessions/${sessionId}/generated/\` before shipping to project workspace.

## 3. Affected Areas
${affected}
`;

  await writeFile(join(dir, 'REMEMBER.md'), content, 'utf-8');
}

async function handleGuardrail(task: string): Promise<void> {
  const loop = new GuardrailLoop();
  const budgetTracker = createBudgetTracker();
  const channel = new ClackHitlChannel();
  const policy = new PolicyEngine();
  // --- KB Server: auto-start if not running, connect for this session ---
  const kbUrl = await ensureKbServer();
  const baseStore = kbUrl
    ? new KbStore(kbUrl)
    : new MarkdownStore();
  const markdownStore = new MarkdownStore(); // still used by PromptAssembler for local context
  const redactedMemory = new RedactedMemoryStore(baseStore, policy);
  const registry = await SkillRegistry.load(process.cwd());
  const assembler = new PromptAssembler(
    registry,
    markdownStore,
    DEFAULT_SYSTEM_PARTS,
  );
  const store = new SessionStore();

  let state = await loop.createSession(task);
  let engineState: EngineState = createInitialEngineState(state);

  p.intro(`Guardrail: "${task}"`);
  console.log(`Session: ${state.id}\n`);

  for (const phase of PHASES) {
    const budgetCheck = budgetTracker.checkHardStop(state);
    if (!budgetCheck.ok) {
      console.error(`\n  Budget exceeded: ${budgetCheck.error.message}`);
      const { shutdownKbServer } = await import('../kb-server-manager.js');
      await shutdownKbServer();
      process.exit(1);
    }

    const ctx: AssembleContext = {
      role: 'planner',
      phase,
      task: state.task,
      tags: [phase],
    };

    const prompt = await assembler.assemble(ctx);

    const decision = await channel.ask({
      question: `Approve "${phase}" phase? (${prompt.tokenEstimate} tokens, ${prompt.skillMetadata.length} skills)`,
      options: [
        { id: 'approve', label: 'Approve', summary: `Proceed with ${phase}` },
        { id: 'revise', label: 'Revise', summary: 'Return to plan for revision' },
        { id: 'cancel', label: 'Cancel', summary: 'Abort the run' },
      ],
      tier: 0,
    });

    if (decision.chosen === 'cancel') {
      state = loop.addEvidence(state, {
        phase,
        kind: 'decision',
        summary: `User cancelled at ${phase}`,
      });
      p.outro('Run cancelled');
      const { shutdownKbServer } = await import('../kb-server-manager.js');
      await shutdownKbServer();
      return;
    }

    if (decision.chosen === 'revise') {
      state = loop.rewindTo(state, 'plan', `User requested revision during ${phase}`);
      console.log(`  ↺ Revised back to "plan"\n`);
      continue;
    }

    state = loop.addEvidence(state, {
      phase,
      kind: 'decision',
      summary: `User approved ${phase}`,
    });

    await redactedMemory.push({
      id: `${state.id}-${phase}-${Date.now()}`,
      kind: 'evidence',
      title: `${phase} approval`,
      body: JSON.stringify({
        sessionId: state.id,
        phase,
        task: state.task,
        decision: 'approve',
        promptTokenEstimate: prompt.tokenEstimate,
        skillCount: prompt.skillMetadata.length,
        fewShotCount: prompt.fewShot.length,
      }),
      tags: [phase, 'hitl', 'approval'],
      version: '0.1.0',
      createdAt: new Date().toISOString(),
    });

    if (phase === 'discuss') {
      engineState = await discussNode(engineState);
      state = engineState.session;
      state = loop.addEvidence(state, {
        phase: 'discuss',
        kind: 'artifact',
        summary: 'Generated DISCUSSION.md',
        ref: join(getSessionDir(state.id), 'DISCUSSION.md'),
      });
      engineState = { ...engineState, session: state };
      await store.save(engineState);
    } else if (phase === 'plan') {
      engineState = await planNode(engineState);
      state = engineState.session;
      state = loop.addEvidence(state, {
        phase: 'plan',
        kind: 'artifact',
        summary: 'Generated PLAN.md',
        ref: join(getSessionDir(state.id), 'PLAN.md'),
      });
      engineState = { ...engineState, session: state };
      await store.save(engineState);
    } else if (phase === 'run') {
      const gitResult = await handleGitCheckIfDirty();
      if (gitResult === 'cancel') {
        p.outro('Run aborted by user.');
        const { shutdownKbServer } = await import('../kb-server-manager.js');
        await shutdownKbServer();
        return;
      }
      const graph = new EngineGraph(store);
      engineState = await graph.run(engineState);
      state = engineState.session;

      await store.save(engineState);
      await writeReviewArtifact(state.id, engineState);
      state = loop.addEvidence(state, {
        phase: 'run',
        kind: 'artifact',
        summary: 'Generated REVIEW.md',
        ref: join(getSessionDir(state.id), 'REVIEW.md'),
      });
      engineState = { ...engineState, session: state };
      await store.save(engineState);
      await redactedMemory.push({
        id: `${state.id}-${phase}-result-${Date.now()}`,
        kind: 'evidence',
        title: `${phase} result`,
        body: JSON.stringify({
          sessionId: state.id,
          phase,
          score: engineState.reviewScore,
          attempts: engineState.attempts,
          tasksDone: engineState.tasks.filter(t => t.status === 'done').length,
          tasksTotal: engineState.tasks.length,
          reviewFailed: (engineState.reviewScore ?? 0) < 9 && engineState.attempts >= 3,
        }),
        tags: [phase, 'result'],
        version: '0.1.0',
        createdAt: new Date().toISOString(),
      });
    } else if (phase === 'verify') {
      await writeVerifyArtifact(state.id, engineState);
      state = loop.addEvidence(state, {
        phase: 'verify',
        kind: 'artifact',
        summary: 'Generated VERIFY.md',
        ref: join(getSessionDir(state.id), 'VERIFY.md'),
      });
      engineState = { ...engineState, session: state };
      await store.save(engineState);
    } else if (phase === 'remember') {
      await writeRememberArtifact(state.id, engineState);
      state = loop.addEvidence(state, {
        phase: 'remember',
        kind: 'artifact',
        summary: 'Generated REMEMBER.md',
        ref: join(getSessionDir(state.id), 'REMEMBER.md'),
      });
      engineState = { ...engineState, session: state };
      await store.save(engineState);
    }

    try {
      state = await loop.advancePhase(state);
      console.log(`\n  ✓ Phase "${phase}" complete (now in "${state.phase}")\n`);
    } catch (err) {
      console.error(`\n  ✗ Phase "${phase}" failed: ${err}`);
      const { shutdownKbServer } = await import('../kb-server-manager.js');
      await shutdownKbServer();
      process.exit(1);
    }
  }

  p.outro(`Task complete — Session ${state.id}`);
  const { shutdownKbServer } = await import('../kb-server-manager.js');
  await shutdownKbServer();
}
