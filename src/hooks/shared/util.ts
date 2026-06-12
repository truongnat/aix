// Purpose: Shared utilities for all hook scripts.
// Layer: infrastructure
// Depends on: nothing

import * as fs from "node:fs";
import * as path from "node:path";

type ArgSpecDef = { type?: "boolean" | "string"; required?: boolean };
type ArgSpec = Record<string, ArgSpecDef>;
type ParsedArgs = { json: boolean; help: boolean; [key: string]: string | boolean | undefined };

export interface HarnessResult {
  ok: boolean;
  summary?: string;
  reason?: string;
  status?: string;
  [key: string]: unknown;
}

export interface HarnessEvent {
  type: string;
  [key: string]: unknown;
}

export function printHelp(scriptName: string, lines: string[]): void {
  console.log(`${scriptName}\n\n${lines.join("\n")}`);
}

export function parseCliArgs(argv: string[], spec: ArgSpec): ParsedArgs {
  const options: ParsedArgs = { json: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    if (!Object.prototype.hasOwnProperty.call(spec, key)) {
      throw new Error(`Unknown argument: ${arg}`);
    }
    const def = spec[key];
    if (def.type === "boolean") {
      options[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    options[key] = value;
    index += 1;
  }

  if (options.help) {
    return options;
  }

  for (const [key, def] of Object.entries(spec)) {
    if (def.required && (options[key] === undefined || options[key] === "")) {
      throw new Error(`Missing required --${key}`);
    }
  }

  return options;
}

export function emitResult(result: HarnessResult, jsonMode: boolean): void {
  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  if (result.ok) {
    console.log(result.summary || "ok");
  } else {
    console.error(result.reason || result.summary || "blocked");
  }
}

export function exitFromResult(result: { ok: boolean }): void {
  process.exit(result.ok ? 0 : 1);
}

export function resolveSessionDir(sessionArg: string, cwd: string = process.cwd()): string {
  const sessionPath = path.resolve(cwd, sessionArg);
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Session path not found: ${sessionArg}`);
  }
  return sessionPath;
}

export function findHarnessRoot(sessionDir: string): string {
  let current = sessionDir;
  while (current !== path.dirname(current)) {
    const harnessDir = path.join(current, ".harness");
    if (fs.existsSync(harnessDir)) {
      return path.dirname(harnessDir);
    }
    if (path.basename(current) === ".harness") {
      return path.dirname(current);
    }
    current = path.dirname(current);
  }
  throw new Error("Could not locate repository root from session path");
}

export function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

export function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`^${fieldName}:\\s*(.*)$`, "im"));
  return match ? match[1].trim() : null;
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function timestampSlug(date: Date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function sanitizeSlug(value: string): string {
  return (
    String(value)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "record"
  );
}

export function writeMarkdownArtifact(filePath: string, sections: (string | null | undefined)[]): string {
  ensureDir(path.dirname(filePath));
  const body = sections.filter(Boolean).join("\n\n");
  fs.writeFileSync(filePath, `${body!.trim()}\n`, "utf8");
  return filePath;
}

export function resolveEventsPath(targetRoot: string): string {
  return path.join(targetRoot, ".harness", "history", "events.jsonl");
}

export function appendHarnessEvent(targetRoot: string, event: HarnessEvent): string {
  const eventsPath = resolveEventsPath(targetRoot);
  ensureDir(path.dirname(eventsPath));
  const payload = {
    ts: new Date().toISOString(),
    ...event,
  };
  fs.appendFileSync(eventsPath, `${JSON.stringify(payload)}\n`, "utf8");
  return eventsPath;
}
