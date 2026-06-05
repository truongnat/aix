#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { loadWalkthroughVideoConfig } = require("../lib/walkthrough-video.js");

const repoRoot = path.resolve(__dirname, "..");
const config = loadWalkthroughVideoConfig(repoRoot);
const readmePath = path.join(repoRoot, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");

const linkPattern = /Walkthrough video: \[([^\]]+)\]\([^)]+\)/;
const replacement = `Walkthrough video: [${config.filename}](${config.url})`;

if (!linkPattern.test(readme)) {
  process.stderr.write("README walkthrough link not found; no changes made.\n");
  process.exit(1);
}

const updated = readme.replace(linkPattern, replacement);
if (updated === readme) {
  process.stdout.write("README walkthrough link already synced.\n");
  process.exit(0);
}

fs.writeFileSync(readmePath, updated, "utf8");
process.stdout.write(`Synced README walkthrough link to ${config.url}\n`);
