// Purpose: Install .ai-harness/ capability cache into target repo
// Layer: infrastructure
// Depends on: domain, legacy lib bridges

import fs from "node:fs";
import path from "node:path";
import { legacyRuntimeCommandCatalog } from "./legacy-deps";
const { installRuntimeCommandCatalog } = legacyRuntimeCommandCatalog;
import { legacyFileOperations } from "./legacy-deps";
const { ensureDirectory } = legacyFileOperations;

const CACHE_DIR = ".ai-harness";

interface InstallCacheOptions {
  packRoot: string | null;
  target: string;
  dryRun: boolean;
  force: boolean;
}

interface CacheInstallResult {
  action: string;
  relativePath: string;
  reason: string;
}

/** Capability surface installed under target/.ai-harness/ (not product repo root). */
const cacheExportPaths = [
  "AGENTS.md",
  "commands",
  "prompt-templates",
  "skills",
  "workflows",
  "patterns",
  "templates",
  "tool-capabilities",
  "scripts/discover-tools.js",
  "scripts/discover-provider-tools.js",
  "scripts/discover-report-templates.js",
  "hooks/",
  "agent-system/",
  "PACK.md",
  "README.md",
  "docs/harness-init-usage.md",
  "docs/tool-discovery-and-routing.md",
  "docs/session-memory.md",
  "docs/memory-migration.md",
  "docs/runtime-aware-validation.md",
  "docs/project-state-policy.md",
  "docs/private-install-git-hygiene.md",
  "docs/plugin-install-ux.md",
  "docs/runtime-dogfood-summary.md",
  "docs/target-repo-validation.md",
  "docs/validation-troubleshooting.md",
];

function parseArgs(argv: string[]): InstallCacheOptions {
  const options: InstallCacheOptions = {
    packRoot: null,
    target: process.cwd(),
    dryRun: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--pack-root") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --pack-root");
      }
      options.packRoot = path.resolve(value);
      index += 1;
      continue;
    }

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --target");
      }
      options.target = path.resolve(value);
      index += 1;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.packRoot) {
    throw new Error("Missing required --pack-root");
  }

  return options;
}

function listFiles(
  packRoot: string,
  relativePath: string,
  depth = 0,
  maxDepth = 20,
  visitedInodes = new Set<string>()
): string[] {
  const MAX_DEPTH = maxDepth;
  if (depth > MAX_DEPTH) {
    return [];
  }

  const sourcePath = path.join(packRoot, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return [];
  }

  const stats = fs.statSync(sourcePath);

  // Detect symlink cycles
  const inode = `${stats.ino}:${stats.dev}`;
  if (visitedInodes.has(inode)) {
    return [];
  }
  visitedInodes.add(inode);

  if (stats.isFile()) {
    return [relativePath];
  }

  if (stats.isSymbolicLink()) {
    return [];
  }

  const files: string[] = [];

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
      continue;
    }
    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(packRoot, childRelativePath, depth + 1, maxDepth, visitedInodes));
    } else if (entry.isFile()) {
      files.push(childRelativePath);
    }
  }

  return files;
}

function cacheRelativePath(relativePath: string): string {
  return `${CACHE_DIR}/${relativePath.split(path.sep).join("/")}`;
}

function installCapabilityCache(
  options: InstallCacheOptions & { packRoot: string }
): CacheInstallResult[] {
  const optionalPaths = ["LICENSE"];
  const relativePaths = [
    ...cacheExportPaths.flatMap((relativePath) => listFiles(options.packRoot, relativePath)),
    ...optionalPaths.filter((relativePath) =>
      fs.existsSync(path.join(options.packRoot, relativePath))
    ),
  ].sort();

  const results: CacheInstallResult[] = [];
  const seen = new Set<string>();

  for (const relativePath of relativePaths) {
    if (seen.has(relativePath)) {
      continue;
    }
    seen.add(relativePath);

    const sourcePath = path.join(options.packRoot, relativePath);
    const destinationPath = path.join(options.target, CACHE_DIR, relativePath);
    const exists = fs.existsSync(destinationPath);

    if (exists && !options.force) {
      results.push({
        action: options.dryRun ? "WOULD SKIP" : "SKIP",
        relativePath: cacheRelativePath(relativePath),
        reason: "exists",
      });
      continue;
    }

    results.push({
      action: options.dryRun ? "WOULD COPY" : "COPY",
      relativePath: cacheRelativePath(relativePath),
      reason: exists ? "overwrite" : "new",
    });

    if (!options.dryRun) {
      ensureDirectory(path.dirname(destinationPath), false);
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }

  const catalogResults = installRuntimeCommandCatalog(options.target, {
    dryRun: options.dryRun,
    force: options.force,
  });
  for (const entry of catalogResults) {
    results.push({
      action: entry.action,
      relativePath: entry.relativePath,
      reason: "runtime-command-catalog",
    });
  }

  return results;
}

function formatResults(results: CacheInstallResult[]): string {
  return results.map((result) => `${result.action} ${result.relativePath}`).join("\n");
}

function main(argv = process.argv.slice(2)): CacheInstallResult[] {
  const options = parseArgs(argv) as InstallCacheOptions & { packRoot: string };
  const results = installCapabilityCache(options);

  console.log(formatResults(results));
  return results;
}

export {
  CACHE_DIR,
  cacheExportPaths,
  formatResults,
  installCapabilityCache,
  cacheRelativePath,
  listFiles,
  main,
  parseArgs,
};
export type { InstallCacheOptions, CacheInstallResult };
