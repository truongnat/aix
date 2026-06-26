export interface EvalCase {
  readonly id: string;
  readonly input: unknown;
  readonly expect?: unknown;
}

export interface RubricScore {
  readonly axis: string;
  readonly score: number;
  readonly max: number;
  readonly note: string;
}

export interface EvalResult {
  readonly caseId: string;
  readonly variant: string;
  readonly scores: readonly RubricScore[];
  readonly total: number;
  readonly tokens: number;
  readonly usd: number;
}
