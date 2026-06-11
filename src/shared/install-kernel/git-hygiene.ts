// Purpose: Private git exclude block management for project installs
// Layer: infrastructure
// Depends on: domain, legacy lib bridges

/**
 * Git-hygiene module: manages the harness-generated delimited block inside
 * `.git/info/exclude` so that harness files can be locally ignored without
 * modifying tracked `.gitignore` files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { EXCLUDE_BLOCK_START, EXCLUDE_BLOCK_END, ignorePathsForProvider } from "./constants";

export interface IgnoreContext {
  targetAbs: string;
  provider: string;
  plannedProviders?: string[];
  initHarness: boolean;
  plannedInitHarness?: boolean;
  installCache: boolean;
  plannedInstallCache?: boolean;
  scope: string;
  visibility: string;
  dryRun: boolean;
  /** Valid values include "info-exclude" and "none". */
  ignoreStrategy?: string;
}

export interface IgnoreResult {
  action: "update" | "skip" | "manual" | "defer";
  paths: string[];
}

interface PendingIgnoreState {
  paths: string[];
}

/** Dedupes ignore paths while preserving first-seen order. */
export function collectIgnorePaths(ctx: IgnoreContext): string[] {
  const plannedProviders = ctx.plannedProviders?.length ? ctx.plannedProviders : [ctx.provider];
  const raw: string[] = [];
  for (const providerId of plannedProviders) {
    raw.push(...ignorePathsForProvider(providerId, ctx.plannedInitHarness ?? ctx.initHarness));
  }
  if (ctx.plannedInstallCache ?? ctx.installCache) {
    raw.push(".ai-harness/");
  }
  // Dedupe preserving first-seen order
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of raw) {
    if (!seen.has(p)) {
      seen.add(p);
      result.push(p);
    }
  }
  return result;
}

/** Build the block content string: START line, each path, END line. */
function buildExcludeBlockContent(paths: string[]): string {
  const lines = [EXCLUDE_BLOCK_START, ...paths.filter((p) => p.length > 0), EXCLUDE_BLOCK_END];
  return lines.join("\n") + "\n";
}

/** Check if the exclude file already has the harness block. */
function hasHarnessBlockInFile(excludeFile: string): boolean {
  if (!fs.existsSync(excludeFile)) return false;
  const content = fs.readFileSync(excludeFile, "utf8");
  return content.split("\n").some((line) => line === EXCLUDE_BLOCK_START);
}

export function hasHarnessExcludeBlock(targetAbs: string): boolean {
  const gitDir = resolveGitDir(targetAbs);
  if (!gitDir) {
    return false;
  }
  return hasHarnessBlockInFile(path.join(gitDir, "info", "exclude"));
}

/**
 * Filter the lines of `existing`, handling the harness block delimited by
 * EXCLUDE_BLOCK_START/END. When `replacement` is provided, the block (markers + body)
 * is replaced by `replacement` lines at the position of the first START marker; when
 * omitted, the block (markers + body) is removed. Lines outside the block are preserved.
 * Always returns text ending in exactly one trailing newline.
 */
function filterExcludeLines(existing: string, replacement?: string[]): string {
  const lines = existing.split("\n");
  const out: string[] = [];
  let skip = false;
  let replaced = false;

  for (const line of lines) {
    if (line === EXCLUDE_BLOCK_START) {
      skip = true;
      if (replacement !== undefined && !replaced) {
        for (const bl of replacement) {
          out.push(bl);
        }
        replaced = true;
      }
      continue;
    }
    if (line === EXCLUDE_BLOCK_END) {
      skip = false;
      continue;
    }
    if (!skip) {
      out.push(line);
    }
  }

  const joined = out.join("\n");
  return joined.endsWith("\n") ? joined : joined + "\n";
}

/** Replace the existing block in the file content with newBlock. */
function replaceBlock(existing: string, newBlock: string): string {
  const replacement = newBlock.replace(/\n$/, "").split("\n");
  return filterExcludeLines(existing, replacement);
}

/** Strip the harness block from content. */
function stripBlock(existing: string): string {
  return filterExcludeLines(existing);
}

function pendingIgnoreStatePath(targetAbs: string): string {
  return path.join(targetAbs, ".ai-harness", "pending-git-exclude.json");
}

function writePendingIgnoreState(targetAbs: string, paths: string[]): void {
  const filePath = pendingIgnoreStatePath(targetAbs);
  const existing = fs.existsSync(filePath)
    ? (JSON.parse(fs.readFileSync(filePath, "utf8")) as PendingIgnoreState)
    : { paths: [] };
  const merged = [...new Set([...(existing.paths || []), ...paths])];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ paths: merged }, null, 2) + "\n", "utf8");
}

function readPendingIgnoreState(targetAbs: string): PendingIgnoreState | null {
  const filePath = pendingIgnoreStatePath(targetAbs);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as PendingIgnoreState;
}

function writeExcludeBlockFromPaths(
  gitDir: string,
  paths: string[],
  dryRun: boolean
): "update" | "skip" {
  const excludeFile = path.join(gitDir, "info", "exclude");
  const blockContent = buildExcludeBlockContent(paths);
  const existing = fs.existsSync(excludeFile) ? fs.readFileSync(excludeFile, "utf8") : "";
  const updated = fs.existsSync(excludeFile)
    ? hasHarnessBlockInFile(excludeFile)
      ? replaceBlock(existing, blockContent)
      : `${existing.trimEnd()}\n\n${blockContent}`.replace(/^\n+/, "")
    : blockContent;

  if (existing === updated) {
    process.stdout.write("SKIP .git/info/exclude\n");
    return "skip";
  }

  if (dryRun) {
    process.stdout.write("WOULD UPDATE .git/info/exclude\n");
    for (const p of paths) {
      if (p.length > 0) {
        process.stdout.write("  ignore: " + p + "\n");
      }
    }
    return "update";
  }

  fs.mkdirSync(path.join(gitDir, "info"), { recursive: true });
  fs.writeFileSync(excludeFile, updated, "utf8");
  process.stdout.write("UPDATE .git/info/exclude\n");
  return "update";
}

function prepareFutureExcludeBlock(
  targetAbs: string,
  paths: string[],
  dryRun: boolean
): "update" | "skip" {
  const futureGitDir = path.join(targetAbs, ".git");
  if (dryRun) {
    process.stdout.write("WOULD PREPARE .git/info/exclude for future git init\n");
    for (const p of paths) {
      if (p.length > 0) {
        process.stdout.write("  ignore: " + p + "\n");
      }
    }
    return "update";
  }

  return writeExcludeBlockFromPaths(futureGitDir, paths, false);
}

function resolveGitDir(targetAbs: string): string | null {
  const gitPath = path.join(targetAbs, ".git");
  if (!fs.existsSync(gitPath)) {
    return null;
  }

  const stat = fs.statSync(gitPath);
  if (stat.isDirectory()) {
    return gitPath;
  }

  const content = fs.readFileSync(gitPath, "utf8");
  const match = content.match(/^gitdir:\s*(.+)$/m);
  if (!match) {
    return null;
  }

  const resolved = path.resolve(targetAbs, match[1].trim());
  return fs.existsSync(resolved) ? resolved : null;
}

/**
 * Returns early (action:"skip") if scope !== "project" or visibility !== "private".
 * Returns action:"update" after preparing a future `.git/info/exclude` if target is not a git repo yet.
 * On dryRun, prints but does not write.
 */
export function applyPrivateIgnore(ctx: IgnoreContext): IgnoreResult {
  const paths = collectIgnorePaths(ctx);

  if (ctx.scope !== "project" || ctx.visibility !== "private") {
    return { action: "skip", paths };
  }

  if (ctx.ignoreStrategy !== undefined && ctx.ignoreStrategy !== "info-exclude") {
    return { action: "skip", paths: [] };
  }

  const gitDir = resolveGitDir(ctx.targetAbs);
  if (!gitDir) {
    const action = prepareFutureExcludeBlock(ctx.targetAbs, paths, ctx.dryRun);
    return { action, paths };
  }

  return { action: writeExcludeBlockFromPaths(gitDir, paths, ctx.dryRun), paths };
}

/**
 * If file absent or no block: prints SKIP, returns action:"skip".
 * On dryRun with block present: prints WOULD UPDATE, returns action:"update" (no write).
 * Otherwise: strips the block, writes, prints UPDATE, returns action:"update".
 */
export function removeIgnoreBlock(opts: { targetAbs: string; dryRun: boolean }): {
  action: "update" | "skip";
} {
  const gitDir = resolveGitDir(opts.targetAbs);
  if (!gitDir) {
    process.stdout.write("SKIP .git/info/exclude\n");
    return { action: "skip" };
  }

  const excludeFile = path.join(gitDir, "info", "exclude");

  if (!fs.existsSync(excludeFile) || !hasHarnessBlockInFile(excludeFile)) {
    process.stdout.write("SKIP .git/info/exclude\n");
    return { action: "skip" };
  }

  if (opts.dryRun) {
    process.stdout.write("WOULD UPDATE .git/info/exclude\n");
    return { action: "update" };
  }

  const existing = fs.readFileSync(excludeFile, "utf8");
  const updated = stripBlock(existing);
  fs.writeFileSync(excludeFile, updated, "utf8");
  process.stdout.write("UPDATE .git/info/exclude\n");
  return { action: "update" };
}

export function reconcileDeferredPrivateIgnore(opts: { targetAbs: string; dryRun: boolean }): {
  action: "update" | "skip";
  paths: string[];
} {
  const pending = readPendingIgnoreState(opts.targetAbs);
  if (!pending?.paths?.length) {
    return { action: "skip", paths: [] };
  }

  const gitDir = resolveGitDir(opts.targetAbs);
  if (!gitDir) {
    return { action: "skip", paths: pending.paths };
  }

  const action = writeExcludeBlockFromPaths(gitDir, pending.paths, opts.dryRun);
  if (!opts.dryRun) {
    fs.rmSync(pendingIgnoreStatePath(opts.targetAbs), { force: true });
  }
  return { action, paths: pending.paths };
}
