import fs from "node:fs";
import path from "node:path";

import type { ParseOptions } from "../cli-args";
import { resolveTargetAbs } from "../cli-command-helpers";
import { mergeStackSignals, parseProjectAnalysis } from "../stack-detect";
import type { StackScanResult } from "../stack-detect";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { stackScanner } = require("../stack-scanner.js") as {
  stackScanner: (target: string) => StackScanResult;
};
import { writeDomainSkillSurface } from "../domain-skill-generation";

function readAnalysisInput(options: ParseOptions): string | null {
  if (options.analysisFile) {
    const resolved = path.isAbsolute(options.analysisFile)
      ? options.analysisFile
      : path.resolve(process.cwd(), options.analysisFile);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Domain analysis file does not exist: ${resolved}`);
    }
    return fs.readFileSync(resolved, "utf8");
  }

  if (!process.stdin.isTTY) {
    const input = fs.readFileSync(0, "utf8");
    if (input.trim()) return input;
  }

  return null;
}

function printWriteResult(
  selectedDomains: string[],
  result: { created: string[]; overwritten: string[]; skipped: string[] }
): void {
  const lines: string[] = [];
  lines.push(
    `Domain skills generated for: ${selectedDomains.length ? selectedDomains.join(", ") : "(none)"}`
  );
  lines.push("");

  const sections = [
    ["Created", result.created],
    ["Overwritten", result.overwritten],
    ["Skipped", result.skipped],
  ] as const;

  for (const [label, paths] of sections) {
    lines.push(`${label} (${paths.length})`);
    if (paths.length === 0) {
      lines.push("  (none)");
    } else {
      for (const p of paths) {
        lines.push(`  - ${p}`);
      }
    }
    lines.push("");
  }

  process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
}

async function runDomainsCommand(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  // Always run scanner for evidence/metadata
  const scan = stackScanner(targetAbs);

  const analysisText = readAnalysisInput(options);

  let domains: string[];
  let stackMeta = scan;

  if (analysisText) {
    // AI-provided analysis: merge with scanner (AI wins on domains/frameworks/languages)
    const aiAnalysis = parseProjectAnalysis(analysisText);
    const merged = mergeStackSignals(
      {
        domains: aiAnalysis.meta.domains,
        frameworks: aiAnalysis.meta.frameworks,
        languages: aiAnalysis.meta.languages,
        notes: aiAnalysis.meta.notes,
      },
      scan
    );
    const mergedParsed = parseProjectAnalysis(JSON.stringify(merged));
    domains = mergedParsed.domains;
    stackMeta = {
      ...scan,
      frameworks: mergedParsed.meta.frameworks,
      languages: mergedParsed.meta.languages,
      notes: mergedParsed.meta.notes,
    };
  } else {
    // No AI analysis: use scanner domains directly
    domains = scan.domains.map((d) => d.id);
  }

  const result = writeDomainSkillSurface(
    packRoot,
    targetAbs,
    domains,
    {
      packRoot,
      targetAbs,
      dryRun: options.dryRun,
      force: options.force,
    },
    stackMeta
  );

  printWriteResult(domains, result);
  return 0;
}

export { runDomainsCommand };
