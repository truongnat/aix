import { Command } from 'commander';
import * as p from '@clack/prompts';
import { GuardrailLoop, createBudgetTracker } from '@x/core';
import type { Phase } from '@x/core';
import { EngineGraph, SessionStore, createInitialEngineState, discussNode, planNode } from '@x/engine';
import type { EngineState } from '@x/engine';
import { PromptAssembler } from '@x/prompt';
import type { AssembleContext } from '@x/prompt';
import { SkillRegistry } from '@x/registry';
import { RedactedMemoryStore, MarkdownStore } from '@x/memory';
import { PolicyEngine } from '@x/policy';
import { ClackHitlChannel } from '@x/hitl';
import { DEFAULT_SYSTEM_PARTS } from '@x/prompt';

const PHASES: readonly Phase[] = ['discuss', 'plan', 'run', 'verify', 'ship', 'remember'];

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
}

async function handleGuardrail(task: string): Promise<void> {
  const loop = new GuardrailLoop();
  const budgetTracker = createBudgetTracker();
  const channel = new ClackHitlChannel();
  const policy = new PolicyEngine();
  const markdownStore = new MarkdownStore();
  const redactedMemory = new RedactedMemoryStore(markdownStore, policy);
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
      await store.save(engineState);
    } else if (phase === 'plan') {
      engineState = await planNode(engineState);
      state = engineState.session;
      await store.save(engineState);
    } else if (phase === 'run') {
      const graph = new EngineGraph(store);
      engineState = await graph.run(engineState);
      state = engineState.session;

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
    }

    try {
      state = await loop.advancePhase(state);
      console.log(`\n  ✓ Phase "${phase}" complete (now in "${state.phase}")\n`);
    } catch (err) {
      console.error(`\n  ✗ Phase "${phase}" failed: ${err}`);
      process.exit(1);
    }
  }

  p.outro(`Task complete — Session ${state.id}`);
}
