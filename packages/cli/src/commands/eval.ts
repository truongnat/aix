import { Command } from 'commander';
import { EvalHarness } from '@x/evals';
import type { EvalCase, VariantRunner } from '@x/evals';

function makeMockRunner(): VariantRunner {
  return async (_variant: string, input: unknown) => {
    const text = String(input ?? '');
    return {
      output: `mock response for: ${text}`,
      tokens: text.split(/\s+/).length,
      usd: 0.001,
    };
  };
}

export function registerEvalCommand(program: Command): void {
  const evalCmd = program.command('eval');

  evalCmd
    .command('list')
    .description('List available eval suites')
    .action(() => {
      console.log('Available suites: (none configured)');
      console.log('Place .json files in .aix/evals/');
    });

  evalCmd
    .command('run <suite>')
    .description('Run an eval suite')
    .option('--variant <variant>', 'Specific variant to test')
    .action(async (suite: string, opts: { variant?: string }) => {
      const runner = makeMockRunner();
      const harness = new EvalHarness(runner);
      const testCases: EvalCase[] = [
        { id: 'test-1', input: 'Hello', expect: 'Hi' },
        { id: 'test-2', input: 'What is AI?', expect: 'Artificial Intelligence' },
      ];
      const variants = opts.variant ? [opts.variant] : ['v1', 'v2'];
      const results = await harness.runAB(testCases, variants);
      const winner = harness.pickWinner(results);
      console.table(
        results.map((r) => ({
          case: r.caseId,
          variant: r.variant,
          total: r.total,
          tokens: r.tokens,
        })),
      );
      console.log(`\nWinner: ${winner}`);
    });
}
