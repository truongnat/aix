const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const exportPaths = [
  "AGENTS.md",
  "commands",
  "prompt-templates",
  "skills",
  "workflows",
  "patterns",
  "templates",
  "docs/concepts.md",
  "docs/command-loop.md",
  "docs/artifact-layout.md",
  "docs/quality-gates.md",
  "docs/adoption-guide.md",
  "docs/install-output-example.md",
  "docs/install-to-profile-walkthrough.md",
  "docs/tool-discovery-and-routing.md",
  "docs/validation-troubleshooting.md",
  "docs/small-repo-memory.md",
  "docs/target-repo-validation.md",
  "docs/target-repo-validation-checklist.md",
  "docs/target-repo-validation-prompts.md",
  "docs/usage-examples.md",
  "docs/host-repo-checklist.md",
  "docs/runtime-compatibility.md"
];

function formatTargetDisplay(targetArg, resolvedTarget) {
  if (targetArg !== null) {
    return targetArg;
  }

  const relative = path.relative(root, resolvedTarget);
  if (relative === "") {
    return ".";
  }
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative;
  }

  return resolvedTarget;
}

function parseArgs(argv) {
  const options = {
    target: process.cwd(),
    targetArg: null,
    dryRun: false,
    force: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --target");
      }
      options.targetArg = value;
      options.target = value;
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

  const resolvedTarget = path.resolve(options.target);

  return {
    ...options,
    target: resolvedTarget,
    targetDisplay: formatTargetDisplay(options.targetArg, resolvedTarget)
  };
}

function listFiles(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const stats = fs.statSync(sourcePath);

  if (stats.isFile()) {
    return [relativePath];
  }

  const files = [];

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(childRelativePath));
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

function installHarness(options) {
  const files = exportPaths.flatMap(listFiles).sort();
  const results = [];

  for (const relativePath of files) {
    const sourcePath = path.join(root, relativePath);
    const destinationPath = path.join(options.target, relativePath);
    const exists = fs.existsSync(destinationPath);

    if (exists && !options.force) {
      results.push({
        action: options.dryRun ? "WOULD SKIP" : "SKIP",
        relativePath,
        reason: "exists"
      });
      continue;
    }

    results.push({
      action: options.dryRun ? "WOULD COPY" : "COPY",
      relativePath,
      reason: exists ? "overwrite" : "new"
    });

    if (!options.dryRun) {
      ensureDirectory(destinationPath, false);
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }

  return results;
}

function formatResults(results) {
  return results.map((result) => `${result.action} ${result.relativePath}`).join("\n");
}

function summarizeResults(results) {
  return results.reduce(
    (summary, result) => {
      if (result.action.endsWith("COPY")) {
        summary.copied += 1;
      } else if (result.action.endsWith("SKIP")) {
        summary.skipped += 1;
      }
      return summary;
    },
    {
      copied: 0,
      skipped: 0,
      failed: 0
    }
  );
}

function formatSummary(options, summary) {
  return [
    "Install summary:",
    `- target: ${options.targetDisplay}`,
    `- mode: ${options.dryRun ? "dry-run" : "write"}`,
    `- copied: ${summary.copied}`,
    `- skipped: ${summary.skipped}`,
    `- failed: ${summary.failed}`
  ].join("\n");
}

function formatNextSteps(options) {
  if (options.dryRun) {
    return [
      "Next steps:",
      "1. Review the files marked WOULD COPY.",
      `2. Run: node install.js --target ${options.targetDisplay}`,
      "3. After install, initialize or refine the `.harness/` artifacts needed for your workflow."
    ].join("\n");
  }

  return [
    "Next steps:",
    "1. Open the target repository.",
    "2. Read AGENTS.md.",
    "3. Create or refine the `.harness/` artifacts needed for your current workflow stage.",
    "4. Use docs/adoption-guide.md and docs/target-repo-validation.md for setup guidance.",
    `5. Validate from the harness source pack: node validate.js --target ${options.targetDisplay} --profile-only`
  ].join("\n");
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const results = installHarness(options);
  const summary = summarizeResults(results);

  console.log(formatResults(results));
  console.log(formatSummary(options, summary));
  console.log(formatNextSteps(options));

  return results;
}

module.exports = {
  exportPaths,
  formatResults,
  formatTargetDisplay,
  formatNextSteps,
  formatSummary,
  installHarness,
  listFiles,
  main,
  parseArgs,
  summarizeResults
};
