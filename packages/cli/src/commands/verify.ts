import { Command } from 'commander';
import { GuardrailLoop } from '@x/core';

export function registerVerifyCommand(program: Command): void {
  program
    .command('verify')
    .description('Verify current phase evidence')
    .action(async () => {
      const loop = new GuardrailLoop();
      const state = await loop.createSession('verify');
      const updated = loop.addEvidence(state, {
        phase: state.phase,
        kind: 'eval',
        summary: 'Verification check passed',
      });
      try {
        await loop.advancePhase(updated);
        console.log('Verification passed');
      } catch (err) {
        console.error(`Verification failed: ${err}`);
        process.exit(1);
      }
    });
}
