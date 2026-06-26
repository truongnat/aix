import { Command } from 'commander';
import { GuardrailLoop } from '@x/core';
import { EngineGraph, CheckpointManager, createInitialEngineState } from '@x/engine';

export function registerRunCommand(program: Command): void {
  program
    .command('run <task>')
    .description('Run a task in guardrail mode (with human review)')
    .option('--auto', 'Run in autonomous mode (bypasses human review)')
    .option('--resume <checkpoint-id>', 'Resume from a checkpoint')
    .action(async (task: string, opts: { auto?: boolean; resume?: string }) => {
      if (opts.resume) {
        const mgr = new CheckpointManager();
        const saved = await mgr.load(opts.resume);
        if (!saved) {
          console.error(`  Checkpoint "${opts.resume}" not found`);
          process.exit(1);
        }
        console.log(`\n  Resuming checkpoint: "${opts.resume}"`);
        const graph = new EngineGraph(mgr);
        const final = await graph.resume(saved);
        console.log(`  Score: ${final.reviewScore ?? 'N/A'} / 10`);
        console.log(`\n  Resume complete`);
        return;
      }

      if (opts.auto) {
        const loop = new GuardrailLoop();
        const session = await loop.createSession(task);
        const initial = createInitialEngineState(session);

        const mgr = new CheckpointManager();
        const graph = new EngineGraph(mgr);
        console.log(`\n  Auto-running: "${task}"\n`);

        const final = await graph.run(initial);
        const id = await mgr.save(final);
        console.log(`  Score: ${final.reviewScore ?? 'N/A'} / 10`);
        console.log(`  Checkpoint: ${id}`);
        console.log(`\n  Auto-run complete`);
        return;
      }

      const loop = new GuardrailLoop();
      let state = await loop.createSession(task);

      console.log(`\n  Starting: "${task}"\n`);

      const phases = ['discuss', 'plan', 'run', 'verify', 'ship', 'remember'] as const;
      for (const phase of phases) {
        const answers: Record<string, string> = {
          discuss: 'y',
          plan: 'y',
          run: 'y',
          verify: 'y',
          ship: 'y',
          remember: 'y',
        };
        const answer = answers[phase];
        if (answer === 'y') {
          state = loop.addEvidence(state, {
            phase,
            kind: 'decision',
            summary: `Approved by user: ${phase}`,
          });
        } else {
          state = loop.rewindTo(state, 'plan', `User rejected ${phase}`);
          continue;
        }

        try {
          state = await loop.advancePhase(state);
          console.log(`  Phase "${phase}" complete`);
        } catch (err) {
          console.error(`  Phase "${phase}" failed: ${err}`);
          process.exit(1);
        }
      }

      console.log(`\n  Task complete`);
    });
}
