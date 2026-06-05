#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function resolveRepoRoot(argv) {
  const flagIndex = argv.indexOf("--repo-root");
  if (flagIndex !== -1 && argv[flagIndex + 1]) {
    return path.resolve(argv[flagIndex + 1]);
  }
  return path.resolve(__dirname, "..");
}

const repoRoot = resolveRepoRoot(process.argv.slice(2));
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const version = pkg.version;

const replacements = [
  {
    relativePath: "README.md",
    update(original) {
      return original
        .replace(
          /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-v\d+\.\d+\.\d+-2563eb\)/,
          `![Version](https://img.shields.io/badge/version-v${version}-2563eb)`
        )
        .replace(
          /Release notes: \[docs\/v\d+\.\d+\.\d+-release-notes\.md\]\(docs\/v\d+\.\d+\.\d+-release-notes\.md\)/,
          `Release notes: [docs/v${version}-release-notes.md](docs/v${version}-release-notes.md)`
        )
        .replace(
          /\*\*v\d+\.\d+\.\d+\*\*: patch release for README clarity, landing-page polish, and release metadata alignment\./,
          `**v${version}**: patch release for README clarity, landing-page polish, and release metadata alignment.`
        );
    },
  },
  {
    relativePath: "docs/README.md",
    update(original) {
      return original.replace(
        /\| \*\*v\d+\.\d+\.\d+\*\* \| \[Release Notes\]\(v\d+\.\d+\.\d+-release-notes\.md\) \|/,
        `| **v${version}** | [Release Notes](v${version}-release-notes.md) |`
      );
    },
  },
];

for (const { relativePath, update } of replacements) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const original = fs.readFileSync(filePath, "utf8");
  const updated = update(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

process.stdout.write(`Synced release-facing surfaces to v${version}\n`);
