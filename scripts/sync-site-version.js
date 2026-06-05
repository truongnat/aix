#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const version = pkg.version;

const targets = [
  "site/src/components/Hero.tsx",
  "site/src/components/Footer.tsx",
  "site/src/components/ProviderCards.tsx",
];

for (const relativePath of targets) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const original = fs.readFileSync(filePath, "utf8");
  const updated = original
    .replace(/v\d+\.\d+\.\d+/g, `v${version}`)
    .replace(/\/v\d+\.\d+\.\d+\//g, `/v${version}/`)
    .replace(/\b\d+\.\d+\.\d+ support\b/g, `${version} support`);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

process.stdout.write(`Synced site components to v${version}\n`);
