import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { DecisionResponse, HitlChannel } from './types.js';
import type { DecisionRequest } from './types.js';

export class ConsoleHitlChannel implements HitlChannel {
  readonly #previewBaseUrl: string | undefined;

  constructor(previewBaseUrl?: string) {
    this.#previewBaseUrl = previewBaseUrl;
  }

  async ask(req: DecisionRequest): Promise<DecisionResponse> {
    const rl = readline.createInterface({ input, output });

    try {
      console.log(`\n❓ ${req.question}\n`);

      if (req.tier >= 1) {
        console.log('  📐 Mermaid preview available');
      }

      if (req.tier >= 2 && this.#previewBaseUrl) {
        for (const opt of req.options) {
          if (opt.artifact) {
            console.log(`  🌐 HTML preview available at ${this.#previewBaseUrl}/${opt.id}`);
          }
        }
      }

      for (let i = 0; i < req.options.length; i++) {
        const opt = req.options[i]!;
        console.log(`  ${i + 1}. ${opt.label}`);
        console.log(`     ${opt.summary}`);
        if (opt.artifact) {
          console.log(`     → Artifact: ${opt.artifact}`);
        }
        console.log();
      }

      const answer = await rl.question(`Choose (1-${req.options.length}): `);
      const idx = parseInt(answer, 10) - 1;

      if (idx < 0 || idx >= req.options.length) {
        console.log('Invalid choice, defaulting to first option');
        return { chosen: req.options[0]!.id };
      }

      const note = await rl.question('Note (optional, press Enter to skip): ');
      const trimmedNote = note.trim();

      return {
        chosen: req.options[idx]!.id,
        ...(trimmedNote.length > 0 ? { note: trimmedNote } : {}),
      };
    } finally {
      rl.close();
    }
  }
}
