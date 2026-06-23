// Purpose: insights command handler
// Layer: presentation
// Depends on: application, features, ui

import path from "node:path";
import type { ParseOptions } from "../args";
import { buildInsights, buildInsightsExport } from "../../features/insights";
import {
  buildEvalRecommendations,
  formatEvalRecommendations,
} from "../../features/insights";
import { runRecommendedEvalRegression } from "../../features/insights";
import { uploadInsightsExport } from "../../features/insights";

async function runInsightsCommand(_packRoot: string, options: ParseOptions): Promise<number> {
  const target = path.resolve(options.target || ".");

  if (options.recommendEvals) {
    const result = buildEvalRecommendations(target);
    if (options.runRecommendedEvals) {
      const regression = await runRecommendedEvalRegression(_packRoot, target, {
        provider: options.providers[0] || "codex",
        liveProviderCommand: options.liveProviderCommand,
        useLlmJudge: options.useLlmJudge,
      });
      if (options.json) {
        process.stdout.write(
          `${JSON.stringify({ recommendations: result, regression }, null, 2)}\n`
        );
        return 0;
      }
      process.stdout.write(formatEvalRecommendations(result));
      process.stdout.write(
        `\nExecuted ${regression.runs.length} recommended eval(s); report: ${regression.reportPath}\n`
      );
      return 0;
    }
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    process.stdout.write(formatEvalRecommendations(result));
    return 0;
  }

  if (options.upload) {
    const result = await uploadInsightsExport(target, { force: options.forceUpload });
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.uploaded ? 0 : 1;
    }
    if (!result.uploaded) {
      process.stderr.write(`${result.reason}\n`);
      return 1;
    }
    process.stdout.write(`Uploaded anonymized telemetry to ${result.endpoint}\n`);
    return 0;
  }

  const result = buildInsights(target);

  if (options.export) {
    const payload = buildInsightsExport(target, {
      anonymize: options.anonymize !== false,
      includeFingerprint: true,
    });
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return 0;
  }

  if (options.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          target: result.target,
          eventsPath: result.eventsPath,
          summary: result.summary,
        },
        null,
        2
      )}\n`
    );
    return 0;
  }

  process.stdout.write(result.output);
  return 0;
}

export { runInsightsCommand };
