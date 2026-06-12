const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { buildEvalRecommendations } = require(
  path.join(repoRoot, "dist", "features", "insights", "index.js")
);

test("buildEvalRecommendations maps guard blocks to eval tasks", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-rec-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"guard-phase","command":"harness-verify","ok":false}\n',
    "utf8"
  );

  const result = buildEvalRecommendations(tempRoot);
  assert.ok(result.recommendations.length >= 1);
  assert.equal(result.recommendations[0].taskId, "sample-verify-md");
});
