import { Command } from 'commander';
import { GuardrailLoop } from '@x/core';

export function registerShipCommand(program: Command): void {
  program
    .command('ship')
    .description('Ship the current deliverable')
    .action(async () => {
      const loop = new GuardrailLoop();
      const state = await loop.createSession('ship');
      const updated = loop.addEvidence(state, {
        phase: 'ship',
        kind: 'decision',
        summary: 'Shipped by user',
      });
      try {
        await loop.advancePhase(updated);
        console.log('Shipped');
      } catch (err) {
        console.error(`Ship failed: ${err}`);
        process.exit(1);
      }
    });
}
