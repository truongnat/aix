#!/usr/bin/env node
"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { loadWalkthroughVideoConfig } = require("../lib/walkthrough-video.js");

function parseArgs(argv) {
  const options = { tag: "", file: "" };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--tag") {
      options.tag = argv[++i] || "";
      continue;
    }
    if (arg === "--file") {
      options.file = argv[++i] || "";
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const options = parseArgs(process.argv);
  const config = loadWalkthroughVideoConfig(repoRoot);
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const tag = options.tag || `v${pkg.version}`;
  const filePath = path.resolve(options.file || config.filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Video file not found: ${filePath}\nProvide --file <path> (do not commit MP4 to git).`
    );
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }

  childProcess.execFileSync(
    "gh",
    ["release", "upload", tag, filePath, "--clobber"],
    { stdio: "inherit" }
  );

  process.stdout.write(
    `Uploaded ${path.basename(filePath)} to release ${tag}.\nURL: ${config.url}\n`
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
