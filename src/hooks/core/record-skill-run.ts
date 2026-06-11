#!/usr/bin/env node
// Purpose: Record a skill invocation as a session artifact.
// Layer: infrastructure
// Depends on: ../shared/util

import * as path from "node:path";
import {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  resolveSessionDir,
  sanitizeSlug,
  timestampSlug,
  writeMarkdownArtifact,
} from "../shared/util";

const SPEC = {
  session: { required: true },
  skill: { required: true },
  status: { required: true },
  summary: { required: true },
};

export function recordSkillRun(options: {
  session: string;
  skill: string;
  status: string;
  summary: string;
}): { ok: boolean; status: string; artifact: string } {
  const sessionDir = resolveSessionDir(options.session);
  const slug = `${sanitizeSlug(options.skill)}-${timestampSlug()}.md`;
  const artifactPath = path.join(sessionDir, "skill-runs", slug);

  writeMarkdownArtifact(artifactPath, [
    "# Skill Run",
    "## Metadata",
    "",
    `skill: ${options.skill}`,
    `status: ${options.status}`,
    `created_at: ${new Date().toISOString()}`,
    "## Summary",
    "",
    options.summary,
    "## Outputs",
    "",
    "- Record skill outputs in session artifacts or linked files.",
  ]);

  return {
    ok: true,
    status: "recorded",
    artifact: path.relative(process.cwd(), artifactPath).replace(/\\/g, "/"),
  };
}

function main(): void {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("record-skill-run.js", [
        "Usage:",
        '  node hooks/core/record-skill-run.js --session <path> --skill verification --status completed --summary "Checks recorded" [--json]',
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session as string);
    const result = recordSkillRun(options as unknown as Parameters<typeof recordSkillRun>[0]);
    try {
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "skill-run",
        skill: options.skill,
        status: options.status,
      });
    } catch {
      // Event logging is best-effort when harness root cannot be resolved.
    }
    emitResult(result, options.json as boolean);
    exitFromResult({ ok: true });
  } catch (error) {
    emitResult(
      { ok: false, reason: (error as Error).message },
      process.argv.includes("--json")
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
