import type { EvalCase, EvalResult } from './types.js';
import { scoreOutput } from './rubric.js';

export interface VariantRunner {
  (variant: string, input: unknown): Promise<{ output: string; tokens: number; usd: number }>;
}

export class EvalHarness {
  constructor(private readonly runner: VariantRunner) {}

  async runAB(suite: EvalCase[], variants: string[]): Promise<EvalResult[]> {
    const results: EvalResult[] = [];
    for (const variant of variants) {
      const vr = await this.runSingle(variant, suite);
      results.push(...vr);
    }
    return results;
  }

  pickWinner(results: EvalResult[]): string {
    const totals: Record<string, number> = {};
    for (const r of results) {
      totals[r.variant] = (totals[r.variant] ?? 0) + r.total;
    }
    let best = '';
    let bestScore = -Infinity;
    for (const [variant, total] of Object.entries(totals)) {
      if (total > bestScore) {
        bestScore = total;
        best = variant;
      }
    }
    return best;
  }

  async runSingle(variant: string, suite: EvalCase[]): Promise<EvalResult[]> {
    const results: EvalResult[] = [];
    for (const c of suite) {
      const { output, tokens, usd } = await this.runner(variant, c.input);
      const scores = scoreOutput(output, c.expect as string | undefined);
      const total = scores.reduce((s, sc) => s + sc.score, 0);
      results.push({
        caseId: c.id,
        variant,
        scores,
        total,
        tokens,
        usd,
      });
    }
    return results;
  }
}
