const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { buildMatrix } = require(path.join(repoRoot, "scripts", "generate-compatibility-matrix.js"));

test("buildMatrix includes providers and eval tasks", () => {
  const markdown = buildMatrix();
  assert.match(markdown, /Claude Code/);
  assert.match(markdown, /sample-bugfix/);
  assert.match(markdown, /example-health-report/);
  assert.match(
    markdown,
    /Codex \| yes \| adapter \| native-command-files \| deterministic local \(31 tasks\) \| (no live evals yet|\d+\/\d+ passed \(\d+% across \d+ task[s]?\))/
  );
  assert.match(
    markdown,
    /Claude Code \| yes \| yes \| native-plugin \| deterministic local \(31 tasks\) \| no live evals yet/
  );
});

test("compatibility-matrix.md is generated on disk", () => {
  const matrixPath = path.join(repoRoot, "docs", "compatibility-matrix.md");
  assert.ok(fs.existsSync(matrixPath));
  const text = fs.readFileSync(matrixPath, "utf8");
  assert.match(text, /Provider Compatibility Matrix/);
});
