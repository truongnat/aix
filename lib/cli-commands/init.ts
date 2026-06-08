import fs from "node:fs";
import path from "node:path";
import { detectProviderBinaries } from "../cli-detect";
import { resolveTargetAbs } from "../cli-command-helpers";
import { runInstallWizard } from "./install";
import type { ParseOptions } from "../cli-args";
import { parseProjectAnalysis, normalizeDomainSelection } from "../stack-detect";
import { runTask } from "../evals";

const INIT_DEMO_GOAL = `# Init Demo Goal

Complete the harness quickstart by confirming install and running one deterministic eval task.

## Steps
1. Confirm \`.harness/\` exists after init.
2. Review eval output from the init demo run.
3. Use \`aih insights\` to inspect local telemetry after your next session.
`;

function readAnalysisFile(analysisFile: string): string {
  const resolved = path.isAbsolute(analysisFile)
    ? analysisFile
    : path.resolve(process.cwd(), analysisFile);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Domain analysis file does not exist: ${resolved}`);
  }
  return fs.readFileSync(resolved, "utf8");
}

async function resolveInitDomains(options: ParseOptions): Promise<string[]> {
  const explicitDomains = normalizeDomainSelection(options.domains || []);
  if (explicitDomains.length > 0) {
    return explicitDomains;
  }

  if (options.analysisFile) {
    const analysisText = readAnalysisFile(options.analysisFile);
    const parsed = parseProjectAnalysis(analysisText);
    return normalizeDomainSelection(parsed.domains);
  }
  return [];
}

async function runInitWizard(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const binaryStatus = detectProviderBinaries();
  const detectedProviders = Object.entries(binaryStatus)
    .filter(([, probe]) => probe.installed)
    .map(([providerId]) => providerId);
  const providers = options.providers.length > 0 ? options.providers : detectedProviders;
  if (providers.length === 0) {
    throw new Error(
      "No supported provider CLI detected. Install claude, codex, cursor, or gemini first."
    );
  }

  const selectedDomains = await resolveInitDomains(options);

  const initOptions = {
    ...options,
    command: "install",
    providers,
    plannedProviders: providers,
    domains: selectedDomains,
    yes: true,
    scope: options.scope || "project",
    visibility: options.visibility || "private",
  };

  process.stdout.write(
    `Initializing harness in ${targetAbs} for provider(s): ${providers.join(", ")}\n`
  );

  const status = await runInstallWizard(packRoot, initOptions);
  if (status !== 0) {
    return status;
  }

  const harnessDir = path.join(targetAbs, ".harness");
  if (!fs.existsSync(harnessDir)) {
    throw new Error("Init completed but .harness/ was not created.");
  }

  const demoGoalPath = path.join(harnessDir, "GOAL.md");
  if (!fs.existsSync(demoGoalPath)) {
    fs.writeFileSync(demoGoalPath, `${INIT_DEMO_GOAL}\n`, "utf8");
  }

  if (!options.skipDemoEval) {
    process.stdout.write("\nRunning init demo eval (sample-bugfix)...\n");
    const evalResult = await runTask(packRoot, "sample-bugfix", {
      provider: "deterministic-local",
      targetRoot: targetAbs,
    });
    process.stdout.write(`Demo eval summary: ${evalResult.summaryPath}\n`);
    if (evalResult.comparison && evalResult.comparison.selfCorrectionDemonstrated) {
      process.stdout.write("Harness A/B delta: with-harness passed, without-harness failed.\n");
    }
    if (evalResult.exitCode !== 0) {
      return evalResult.exitCode;
    }
  }

  process.stdout.write("\nInit complete.\n");
  process.stdout.write("Next:\n");
  process.stdout.write("  npx ai-engineering-harness status\n");
  process.stdout.write("  npx ai-engineering-harness eval list\n");
  process.stdout.write("  npx ai-engineering-harness insights\n");
  process.stdout.write(`See docs/first-5-minutes.md and docs/insights.md\n`);

  return 0;
}

export { runInitWizard };
