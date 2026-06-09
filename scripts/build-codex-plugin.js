#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const manifestPath = path.join(repoRoot, ".codex-plugin", "plugin.json");
const defaultOutputRoot = path.join(repoRoot, "dist", "codex-plugin");

const BUNDLE_PATHS = [
  ".codex-plugin/plugin.json",
  "skills/",
  "commands/",
  "agents/",
  "hooks/",
  "hooks.json",
];

function cleanOutputRoot(outputRoot) {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
}

function validatePluginManifest() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.version !== packageJson.version) {
    throw new Error(
      `Codex plugin manifest version ${manifest.version} does not match package.json version ${packageJson.version}`
    );
  }
}

function buildCodexPluginBundle(outputRoot = defaultOutputRoot) {
  validatePluginManifest();
  cleanOutputRoot(outputRoot);

  for (const relativePath of BUNDLE_PATHS) {
    const sourcePath = path.join(repoRoot, relativePath);
    const destinationPath = path.join(outputRoot, relativePath);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing Codex plugin source path: ${relativePath}`);
    }
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });
  }

  return outputRoot;
}

function parseOutDir(argv) {
  const flag = argv.indexOf("--out-dir");
  if (flag === -1) {
    return defaultOutputRoot;
  }
  const value = argv[flag + 1];
  if (!value) {
    throw new Error("Missing value for --out-dir");
  }
  return path.resolve(repoRoot, value);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write(
      [
        "build-codex-plugin.js",
        "",
        "Usage:",
        "  node scripts/build-codex-plugin.js [--out-dir <path>]",
        "",
        "Builds a Codex plugin bundle under dist/codex-plugin/ with:",
        "  - .codex-plugin/plugin.json",
        "  - skills/",
        "  - commands/",
        "  - agents/",
        "  - hooks/",
        "  - hooks.json",
        "",
        "Use --out-dir to write the bundle elsewhere.",
        "",
      ].join("\n")
    );
    return;
  }

  const bundleRoot = buildCodexPluginBundle(parseOutDir(process.argv.slice(2)));
  process.stdout.write(`${bundleRoot}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildCodexPluginBundle,
  BUNDLE_PATHS,
};
