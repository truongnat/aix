interface EvalCase {
    readonly id: string;
    readonly input: unknown;
    readonly expect?: unknown;
}
interface RubricScore {
    readonly axis: string;
    readonly score: number;
    readonly max: number;
    readonly note: string;
}
interface EvalResult {
    readonly caseId: string;
    readonly variant: string;
    readonly scores: readonly RubricScore[];
    readonly total: number;
    readonly tokens: number;
    readonly usd: number;
}

interface RubricAxis {
    readonly name: string;
    readonly max: number;
}
declare const STANDARD_AXES: readonly RubricAxis[];
declare function scoreOutput(output: string, expected?: string): RubricScore[];

interface VariantRunner {
    (variant: string, input: unknown): Promise<{
        output: string;
        tokens: number;
        usd: number;
    }>;
}
declare class EvalHarness {
    private readonly runner;
    constructor(runner: VariantRunner);
    runAB(suite: EvalCase[], variants: string[]): Promise<EvalResult[]>;
    pickWinner(results: EvalResult[]): string;
    runSingle(variant: string, suite: EvalCase[]): Promise<EvalResult[]>;
}

export { type EvalCase, EvalHarness, type EvalResult, type RubricAxis, type RubricScore, STANDARD_AXES, type VariantRunner, scoreOutput };
