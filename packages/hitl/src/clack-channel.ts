import * as p from '@clack/prompts';
import type { DecisionResponse, HitlChannel } from './types.js';
import type { DecisionRequest } from './types.js';

export class ClackHitlChannel implements HitlChannel {
  async ask(req: DecisionRequest): Promise<DecisionResponse> {
    const options = req.options.map(opt => ({
      value: opt.id,
      label: opt.label,
      hint: opt.summary,
    }));

    const result = await p.select({
      message: req.question,
      options,
    });

    if (p.isCancel(result)) {
      return { chosen: 'cancel' };
    }

    return { chosen: result as string };
  }
}
