#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, ".ai-harness", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  let targetRoot = process.cwd();
  let asJson = false;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--target" && args[i + 1]) {
      targetRoot = path.resolve(args[i + 1]);
      i += 1;
      continue;
    }
    if (args[i] === "--json") {
      asJson = true;
      continue;
    }
    if (args[i] === "--help" || args[i] === "-h") {
      process.stdout.write(
        "Usage: node scripts/discover-provider-tools.js [--target <repo>] [--json]\n"
      );
      return;
    }
  }

  const generatedPath = path.join(targetRoot, ".ai-harness", "provider-interaction.md");
  if (fs.existsSync(generatedPath)) {
    const content = fs.readFileSync(generatedPath, "utf8");
    if (asJson) {
      process.stdout.write(
        `${JSON.stringify({ source: "file", path: generatedPath, content }, null, 2)}\n`
      );
      return;
    }
    process.stdout.write(content);
    return;
  }

  let rendered = null;
  try {
    const mod = require(path.join(__dirname, "..", "dist", "features", "install", "infrastructure", "provider-interaction-tools.js"));
    const manifest = readManifest(targetRoot);
    if (manifest) {
      rendered = mod.renderProviderInteractionFromManifest(manifest);
    }
  } catch {
    rendered = null;
  }

  if (!rendered) {
    const message =
      "provider-interaction: missing .ai-harness/provider-interaction.md — run npx ai-engineering-harness install\n";
    if (asJson) {
      process.stdout.write(`${JSON.stringify({ error: message.trim() }, null, 2)}\n`);
      process.exitCode = 1;
      return;
    }
    process.stderr.write(message);
    process.exitCode = 1;
    return;
  }

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify({ source: "generated", content: rendered }, null, 2)}\n`
    );
    return;
  }
  process.stdout.write(rendered);
}

if (require.main === module) {
  main();
}
