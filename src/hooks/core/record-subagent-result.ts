#!/usr/bin/env node
// Purpose: Record a subagent result and optionally append to worker memory.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
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

const DEFAULT_WORKER_MEMORY_DIR = ".harness/memory/workers";
const DEFAULT_WORKER_MEMORY_LIMIT = 8;

const SPEC = {
  session: { required: true },
  agent: { required: true },
  status: { required: true },
  summary: { required: true },
  "ready-to-continue": { required: false },
  "next-command": { required: false },
};

interface HarnessConfig {
  workerMemory?: {
    enabled?: boolean;
    directory?: string;
    maxEntries?: number;
  };
}

function loadHarnessConfig(repoRoot: string): HarnessConfig | null {
  const configPath = path.join(repoRoot, ".harness", "config.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8")) as HarnessConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in .harness/config.json: ${message}`);
  }
}

function normalizeWorkerMemoryNote(options: { summary?: string; status?: string }): string {
  return String(options.summary || options.status || "subagent result")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function parseWorkerMemoryEntries(content: string): string[] {
  const lines = content.split("\n");
  const entries: string[] = [];
  let inNotes = false;
  for (const line of lines) {
    if (line.startsWith("## Durable Notes")) {
      inNotes = true;
      continue;
    }
    if (inNotes && line.startsWith("## ")) {
      break;
    }
    if (inNotes && line.startsWith("- ")) {
      const entry = line.slice(2).trim();
      if (entry && entry !== "No durable notes yet.") {
        entries.push(entry);
      }
    }
  }
  return entries;
}

function renderWorkerMemory(agent: string, entries: string[]): string {
  return [
    `# Worker Memory: ${agent}`,
    "",
    "> Compact, non-sensitive notes from delegated worker runs.",
    "",
    "## Durable Notes",
    "",
    ...(entries.length > 0 ? entries.map((entry) => `- ${entry}`) : ["- No durable notes yet."]),
  ].join("\n");
}

function updateWorkerMemory(
  repoRoot: string,
  options: { agent: string; status: string; summary: string }
): string | null {
  const config = loadHarnessConfig(repoRoot);
  if (!config?.workerMemory?.enabled) {
    return null;
  }

  const workerMemoryConfig = config.workerMemory;
  const memoryDir =
    typeof workerMemoryConfig.directory === "string" && workerMemoryConfig.directory.trim()
      ? workerMemoryConfig.directory
      : DEFAULT_WORKER_MEMORY_DIR;
  const maxEntries =
    Number.isInteger(workerMemoryConfig.maxEntries) &&
    (workerMemoryConfig.maxEntries ?? 0) > 0
      ? workerMemoryConfig.maxEntries!
      : DEFAULT_WORKER_MEMORY_LIMIT;
  const memoryPath = path.join(repoRoot, memoryDir, `${sanitizeSlug(options.agent)}.md`);
  const note = `${new Date().toISOString()} | ${options.status} | ${normalizeWorkerMemoryNote(options)}`;
  const existingEntries = fs.existsSync(memoryPath)
    ? parseWorkerMemoryEntries(fs.readFileSync(memoryPath, "utf8"))
    : [];
  const entries = [note, ...existingEntries.filter((entry) => entry !== note)].slice(0, maxEntries);

  writeMarkdownArtifact(memoryPath, [renderWorkerMemory(options.agent, entries)]);

  return path.relative(repoRoot, memoryPath).replace(/\\/g, "/");
}

export function recordSubagentResult(options: {
  session: string;
  agent: string;
  status: string;
  summary: string;
  "ready-to-continue"?: string;
  "next-command"?: string;
}): { ok: boolean; status: string; artifact: string; workerMemory: string | null } {
  const sessionDir = resolveSessionDir(options.session);
  const repoRoot = findHarnessRoot(sessionDir);
  const slug = `${sanitizeSlug(options.agent)}-${timestampSlug()}.md`;
  const artifactPath = path.join(sessionDir, "subagents", slug);

  writeMarkdownArtifact(artifactPath, [
    "# Subagent Run",
    "## Metadata",
    "",
    `agent: ${options.agent}`,
    `status: ${options.status}`,
    `ready_to_continue: ${options["ready-to-continue"] || "unknown"}`,
    `created_at: ${new Date().toISOString()}`,
    "## Task",
    "",
    options.summary,
    "## Result",
    "",
    "Paste the worker Agent Result envelope here when available.",
    "## Main Agent Decision",
    "",
    `next_command: ${options["next-command"] || "harness-verify"}`,
  ]);

  const workerMemory = updateWorkerMemory(repoRoot, options);

  return {
    ok: true,
    status: "recorded",
    artifact: path.relative(process.cwd(), artifactPath).replace(/\\/g, "/"),
    workerMemory,
  };
}

function main(): void {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("record-subagent-result.js", [
        "Usage:",
        '  node hooks/core/record-subagent-result.js --session <path> --agent harness-reviewer --status issues-found --summary "Review complete" [--json]',
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session as string);
    const result = recordSubagentResult(options as unknown as Parameters<typeof recordSubagentResult>[0]);
    try {
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "subagent-run",
        agent: options.agent,
        status: options.status,
        ready_to_continue: options["ready-to-continue"] || null,
        next_command: options["next-command"] || null,
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
