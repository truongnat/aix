"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CONTRACT_PLACEHOLDER_BULLETS = new Set([
  "tbd",
  "todo",
  "fixme",
  "n/a",
  "na",
  "none",
  "-",
  "—",
  "...",
  "placeholder",
  "[ ]",
  "[]"
]);

const HARNESS_COMMAND_PATTERN = /harness-[a-z][a-z0-9-]*/;

function resolvePath(baseDir, relativePath) {
  return path.join(baseDir, relativePath);
}

function assertExists(baseDir, relativePath, failures) {
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required path: ${relativePath}`);
  }
}

function readFile(baseDir, relativePath) {
  return fs.readFileSync(resolvePath(baseDir, relativePath), "utf8");
}

function extractMachineField(content, fieldName) {
  const match = content.match(new RegExp(`^${fieldName}:\\s*(.*)$`, "im"));
  if (!match) {
    return null;
  }
  return match[1].trim();
}

function extractMarkdownSection(content, heading) {
  const index = content.indexOf(heading);
  if (index === -1) {
    return null;
  }
  const rest = content.slice(index + heading.length);
  const nextHeading = rest.search(/\n## /);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

function isPlaceholderBullet(text) {
  const bullet = text.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
  if (bullet.length < 2) {
    return true;
  }
  const lower = bullet.toLowerCase();
  if (CONTRACT_PLACEHOLDER_BULLETS.has(lower)) {
    return true;
  }
  if (/^tbd\b/i.test(bullet)) {
    return true;
  }
  if (/^\[?\s*\]?\s*$/.test(bullet)) {
    return true;
  }
  return false;
}

function hasSubstantiveSectionBody(sectionBody, options = {}) {
  const minChars = options.minChars ?? 12;
  if (!sectionBody || !sectionBody.trim()) {
    return false;
  }

  const lines = sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let chars = 0;
  let count = 0;

  for (const line of lines) {
    if (isPlaceholderBullet(line)) {
      continue;
    }
    const bullet = line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
    if (bullet.length < 3) {
      continue;
    }
    chars += bullet.length;
    count += 1;
  }

  return count > 0 && chars >= minChars;
}

function hasConcreteFailureRule(sectionBody) {
  if (!sectionBody || !sectionBody.trim()) {
    return false;
  }
  return sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => {
      if (isPlaceholderBullet(line)) {
        return false;
      }
      const text = line.replace(/^[-*]\s*/, "").trim();
      return /^(?:Do not|Never|Must not|Stop|Block|Reject|Avoid)\b/i.test(text);
    });
}

function assertHeadings(baseDir, relativePath, headings, failures) {
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of headings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertNonEmpty(baseDir, relativePath, failures) {
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  if (readFile(baseDir, relativePath).trim().length === 0) {
    failures.push(`${relativePath} is empty`);
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }
  const block = match[1];
  const data = {};
  let currentKey = null;
  let listMode = false;

  for (const line of block.split("\n")) {
    if (/^\s+-\s+/.test(line) && currentKey && listMode) {
      data[currentKey].push(line.replace(/^\s+-\s+/, "").trim());
      continue;
    }
    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyMatch) {
      continue;
    }
    currentKey = keyMatch[1];
    const value = keyMatch[2].trim();
    if (value === "") {
      data[currentKey] = [];
      listMode = true;
      continue;
    }
    listMode = false;
    data[currentKey] = value;
  }
  return data;
}

function parseNestedFrontmatterMap(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*$`, "m"));
  if (!match) {
    return null;
  }
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const map = {};
  for (const line of rest.split("\n")) {
    if (!/^\s{2}\S/.test(line)) {
      if (Object.keys(map).length > 0) {
        break;
      }
      continue;
    }
    const entry = line.match(/^\s{2}([A-Za-z0-9_-]+):\s*(\S+)\s*$/);
    if (entry) {
      map[entry[1]] = entry[2];
    }
  }
  return Object.keys(map).length > 0 ? map : null;
}

module.exports = {
  HARNESS_COMMAND_PATTERN,
  assertExists,
  assertHeadings,
  assertNonEmpty,
  extractMachineField,
  extractMarkdownSection,
  hasConcreteFailureRule,
  hasSubstantiveSectionBody,
  isPlaceholderBullet,
  parseFrontmatter,
  parseNestedFrontmatterMap,
  readFile,
  resolvePath
};
