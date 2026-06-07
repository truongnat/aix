/**
 * Git-hygiene module: manages the harness-generated delimited block inside
 * .git/info/exclude so that harness files can be locally ignored without
 * modifying tracked .gitignore files.
 *
 * Mirrors the shell functions in aih.sh:
 *   - git_info_exclude_path (204-206)
 *   - has_harness_exclude_block (208-211)
 *   - collect_ignore_paths (272-279)
 *   - build_exclude_block_content (557-567)
 *   - append_or_update_info_exclude_block (569-610)
 *   - remove_info_exclude_block (612-636)
 *   - print_manual_ignore_instructions (638-647)
 *   - apply_private_ignore (649-665)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { EXCLUDE_BLOCK_START, EXCLUDE_BLOCK_END, ignorePathsForProvider } from "./constants";

export interface IgnoreContext {
  targetAbs: string;
  provider: string;
  initHarness: boolean;
  installCache: boolean;
  scope: string;
  visibility: string;
  dryRun: boolean;
  /** Mirrors aih.sh EFFECTIVE_IGNORE_STRATEGY. Valid values include "info-exclude" and "none".
   *  When undefined, defaults to "info-exclude" so existing callers are unaffected. */
  ignoreStrategy?: string;
}

export interface IgnoreResult {
  action: "update" | "skip" | "manual";
  paths: string[];
}

/** Mirrors aih.sh collect_ignore_paths (lines 272-279).
 *  Dedupes preserving first-seen order (awk '!seen[$0]++' behaviour). */
export function collectIgnorePaths(ctx: IgnoreContext): string[] {
  const raw: string[] = ignorePathsForProvider(ctx.provider, ctx.initHarness);
  if (ctx.installCache) {
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
function hasHarnessBlock(excludeFile: string): boolean {
  if (!fs.existsSync(excludeFile)) return false;
  const content = fs.readFileSync(excludeFile, "utf8");
  return content.split("\n").some((line) => line === EXCLUDE_BLOCK_START);
}

/**
 * Filter the lines of `existing`, handling the harness block delimited by
 * EXCLUDE_BLOCK_START/END. When `replacement` is provided, the block (markers + body)
 * is replaced by `replacement` lines at the position of the first START marker; when
 * omitted, the block (markers + body) is removed. Lines outside the block are preserved.
 * Always returns text ending in exactly one trailing newline (matches awk `print`).
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
  // Always guarantee exactly one trailing newline (mirrors awk print behaviour)
  return joined.endsWith("\n") ? joined : joined + "\n";
}

/** Replace the existing block in the file content with newBlock.
 *  Mirrors the awk at aih.sh:594-607. */
function replaceBlock(existing: string, newBlock: string): string {
  // Strip trailing newline from newBlock before splitting into replacement lines
  const replacement = newBlock.replace(/\n$/, "").split("\n");
  return filterExcludeLines(existing, replacement);
}

/** Strip the harness block from content. Mirrors aih.sh:629-634. */
function stripBlock(existing: string): string {
  return filterExcludeLines(existing);
}

/** Print manual ignore instructions to stderr. Mirrors aih.sh print_manual_ignore_instructions. */
function printManualIgnoreInstructions(paths: string[]): void {
  process.stderr.write(
    "ai-engineering-harness installer: not a Git repository (or no .git/info/exclude).\n"
  );
  process.stderr.write(
    "  Generated files may appear as untracked. To ignore locally, add to .git/info/exclude:\n"
  );
  process.stderr.write("  " + EXCLUDE_BLOCK_START + "\n");
  for (const p of paths) {
    if (p.length > 0) {
      process.stderr.write("  " + p + "\n");
    }
  }
  process.stderr.write("  " + EXCLUDE_BLOCK_END + "\n");
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

/** Mirrors aih.sh apply_private_ignore (lines 649-665) and
 *  append_or_update_info_exclude_block (lines 569-610).
 *
 * Returns early (action:"skip") if scope !== "project" or visibility !== "private".
 * Returns action:"manual" if target is not a git repo.
 * On dryRun, prints but does not write.
 */
export function applyPrivateIgnore(ctx: IgnoreContext): IgnoreResult {
  const paths = collectIgnorePaths(ctx);

  // Mirror apply_private_ignore guard: skip if not project/private scope
  if (ctx.scope !== "project" || ctx.visibility !== "private") {
    return { action: "skip", paths };
  }

  // Mirror apply_private_ignore guard: skip if EFFECTIVE_IGNORE_STRATEGY != info-exclude
  if (ctx.ignoreStrategy !== undefined && ctx.ignoreStrategy !== "info-exclude") {
    return { action: "skip", paths: [] };
  }

  const gitDir = resolveGitDir(ctx.targetAbs);
  if (!gitDir) {
    printManualIgnoreInstructions(paths);
    return { action: "manual", paths };
  }

  const excludeFile = path.join(gitDir, "info", "exclude");
  const blockContent = buildExcludeBlockContent(paths);

  if (ctx.dryRun) {
    process.stdout.write("WOULD UPDATE .git/info/exclude\n");
    for (const p of paths) {
      if (p.length > 0) {
        process.stdout.write("  ignore: " + p + "\n");
      }
    }
    return { action: "update", paths };
  }

  // Ensure .git/info directory exists
  fs.mkdirSync(path.join(gitDir, "info"), { recursive: true });

  if (!fs.existsSync(excludeFile)) {
    // File doesn't exist: write just the block
    fs.writeFileSync(excludeFile, blockContent, "utf8");
  } else if (!hasHarnessBlock(excludeFile)) {
    // File exists but no block: append blank line then block
    const existing = fs.readFileSync(excludeFile, "utf8");
    fs.writeFileSync(excludeFile, existing + "\n" + blockContent, "utf8");
  } else {
    // File exists with block: replace in place
    const existing = fs.readFileSync(excludeFile, "utf8");
    const updated = replaceBlock(existing, blockContent);
    fs.writeFileSync(excludeFile, updated, "utf8");
  }

  process.stdout.write("UPDATE .git/info/exclude\n");
  return { action: "update", paths };
}

/** Mirrors aih.sh remove_info_exclude_block (lines 612-636).
 *
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

  if (!fs.existsSync(excludeFile) || !hasHarnessBlock(excludeFile)) {
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
