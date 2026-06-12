#!/usr/bin/env node
// Purpose: Record a tool run result as a session artifact.
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
  command: { required: true },
  "exit-code": { required: true },
  summary: { required: true },
  "used-by": { required: false },
};

export function recordToolOutput(options: {
  session: string;
  command: string;
  "exit-code": string;
  summary: string;
  "used-by"?: string;
}): { ok: boolean; status: string; artifact: string; result: string } {
  const sessionDir = resolveSessionDir(options.session);
  const exitCode = Number(options["exit-code"]);
  const result = Number.isNaN(exitCode) ? "unknown" : exitCode === 0 ? "passed" : "failed";
  const slug = `${sanitizeSlug(options.command)}-${timestampSlug()}.md`;
  const artifactPath = path.join(sessionDir, "artifacts", "tool-runs", slug);

  writeMarkdownArtifact(artifactPath, [
    "# Tool Run",
    "## Metadata",
    "",
    `command: ${options.command}`,
    `exit_code: ${Number.isNaN(exitCode) ? options["exit-code"] : exitCode}`,
    `result: ${result}`,
    `used_by: ${options["used-by"] || "harness-verify"}`,
    `created_at: ${new Date().toISOString()}`,
    "## Summary",
    "",
    options.summary,
    "## Output Excerpt",
    "",
    "```txt",
    "Full command output was not stored by default.",
    "```",
  ]);

  return {
    ok: true,
    status: "recorded",
    artifact: path.relative(process.cwd(), artifactPath).replace(/\\/g, "/"),
    result,
  };
}

function main(): void {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("record-tool-output.js", [
        "Usage:",
        '  node hooks/core/record-tool-output.js --session <path> --command "npm test" --exit-code 0 --summary "All tests passed" [--used-by harness-verify] [--json]',
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session as string);
    const result = recordToolOutput(options as unknown as Parameters<typeof recordToolOutput>[0]);
    try {
      const exitCode = Number(options["exit-code"]);
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "tool-run",
        command: options.command,
        exit_code: Number.isNaN(exitCode) ? options["exit-code"] : exitCode,
        result: result.result,
        used_by: options["used-by"] || "harness-verify",
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
