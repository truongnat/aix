#!/usr/bin/env node
/**
 * Merge JSON config fragments for runtime install (dependency-free Node).
 * Usage: node merge-config.js <targetFile> <fragmentFile> [--force-plugin <path>]
 */
"use strict";

const fs = require("fs");
const path = require("path");

const [targetFile, fragmentFile, ...rest] = process.argv.slice(2);
const forcePluginIdx = rest.indexOf("--force-plugin");
const forcePlugin = forcePluginIdx >= 0 ? rest[forcePluginIdx + 1] : null;

if (!targetFile || !fragmentFile) {
  console.error("Usage: node merge-config.js <targetFile> <fragmentFile> [--force-plugin <pluginEntry>]");
  process.exit(1);
}

function deepMerge(base, patch) {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

let base = {};
if (fs.existsSync(targetFile)) {
  try {
    base = JSON.parse(fs.readFileSync(targetFile, "utf8"));
  } catch (err) {
    console.error(`Failed to parse ${targetFile}: ${err.message}`);
    process.exit(1);
  }
}

const fragment = JSON.parse(fs.readFileSync(fragmentFile, "utf8"));
const merged = deepMerge(base, fragment);

if (forcePlugin) {
  merged.plugin = merged.plugin || [];
  if (!merged.plugin.includes(forcePlugin)) {
    merged.plugin.push(forcePlugin);
  }
}

fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`MERGED ${targetFile}`);
