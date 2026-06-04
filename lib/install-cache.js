const fs = require("node:fs");
const path = require("node:path");
const { installRuntimeCommandCatalog } = require("./runtime-command-catalog.js");

const CACHE_DIR = ".ai-harness";

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
  "PACK.md",
  "README.md",
  "docs/harness-init-usage.md",
  "docs/tool-discovery-and-routing.md",
  "docs/runtime-aware-validation.md",
  "docs/project-state-policy.md",
  "docs/private-install-git-hygiene.md",
  "docs/plugin-install-ux.md",
  "docs/runtime-dogfood-summary.md",
  "docs/target-repo-validation.md",
  "docs/validation-troubleshooting.md"
];

function parseArgs(argv) {
  const options = {
    packRoot: null,
    target: process.cwd(),
    dryRun: false,
    force: false
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

function listFiles(packRoot, relativePath) {
  const sourcePath = path.join(packRoot, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return [];
  }

  const stats = fs.statSync(sourcePath);

  if (stats.isFile()) {
    return [relativePath];
  }

  const files = [];

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }
    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(packRoot, childRelativePath));
    } else if (entry.isFile()) {
      files.push(childRelativePath);
    }
  }

  return files;
}

function ensureDirectory(filePath, dryRun) {
  const dirPath = path.dirname(filePath);
  if (dryRun || fs.existsSync(dirPath)) {
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function cacheRelativePath(relativePath) {
  return `${CACHE_DIR}/${relativePath.split(path.sep).join("/")}`;
}

function installCapabilityCache(options) {
  const optionalPaths = ["LICENSE"];
  const relativePaths = [
    ...cacheExportPaths.flatMap((relativePath) => listFiles(options.packRoot, relativePath)),
    ...optionalPaths.filter((relativePath) =>
      fs.existsSync(path.join(options.packRoot, relativePath))
    )
  ].sort();

  const results = [];
  const seen = new Set();

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
        reason: "exists"
      });
      continue;
    }

    results.push({
      action: options.dryRun ? "WOULD COPY" : "COPY",
      relativePath: cacheRelativePath(relativePath),
      reason: exists ? "overwrite" : "new"
    });

    if (!options.dryRun) {
      ensureDirectory(destinationPath, false);
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }

  const catalogResults = installRuntimeCommandCatalog(options.target, {
    dryRun: options.dryRun,
    force: options.force
  });
  for (const entry of catalogResults) {
    results.push({
      action: entry.action,
      relativePath: entry.relativePath,
      reason: "runtime-command-catalog"
    });
  }

  return results;
}

function formatResults(results) {
  return results.map((result) => `${result.action} ${result.relativePath}`).join("\n");
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const results = installCapabilityCache(options);

  console.log(formatResults(results));
  return results;
}

module.exports = {
  CACHE_DIR,
  cacheExportPaths,
  formatResults,
  installCapabilityCache,
  cacheRelativePath,
  listFiles,
  main,
  parseArgs
};
