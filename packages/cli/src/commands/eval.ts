import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from 'commander';
import { EvalHarness } from '@x/evals';
import type { EvalCase, VariantRunner } from '@x/evals';

const EVALS_DIR = '.aix/evals';

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

function loadSuite(suiteName: string): EvalCase[] {
  const path = resolve(EVALS_DIR, `${suiteName}.json`);
  if (!existsSync(path)) {
    console.error(`Suite not found: ${path}`);
    console.error('Place .json files in .aix/evals/');
    process.exit(1);
  }
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as EvalCase[];
}

function listSuites(): string[] {
  const dir = resolve(EVALS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

async function runSuite(suite: string, opts: { variant?: string }): Promise<void> {
  console.warn('[eval] mock runner active (no LLM wired to CLI)');
  const runner = makeMockRunner();
  const harness = new EvalHarness(runner);
  const testCases = loadSuite(suite);
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
}

export function registerEvalCommand(program: Command): void {
  const evalCmd = program.command('eval');

  evalCmd
    .command('list')
    .description('List available eval suites')
    .action(() => {
      const suites = listSuites();
      if (suites.length === 0) {
        console.log('No eval suites found. Place .json files in .aix/evals/');
        return;
      }
      console.log('Available suites:');
      for (const s of suites) {
        console.log(`  ${s}`);
      }
    });

  evalCmd
    .command('run <suite>')
    .description('Run an eval suite')
    .option('--variant <variant>', 'Specific variant to test')
    .action(runSuite);

  // eval <suite> (positional, per spec §4.1)
  evalCmd
    .argument('[suite]', 'Eval suite to run')
    .option('--variant <variant>', 'Specific variant to test')
    .action((suite: string | undefined, opts: { variant?: string }) => {
      if (!suite) {
        console.log('Usage: aix eval [options] <suite>');
        console.log('       aix eval list');
        console.log('       aix eval run <suite>');
        return;
      }
      runSuite(suite, opts);
    });
}
