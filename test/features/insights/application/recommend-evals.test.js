const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const { summarizeEvents } = require(
  path.join(repoRoot, "dist", "features", "insights", "domain", "summary.js")
);
const { buildEvalRecommendations } = require(
  path.join(repoRoot, "dist", "features", "insights", "application", "recommend-evals.js")
);

test("summarizeEvents aggregates guard blocks", () => {
  const summary = summarizeEvents([{ type: "guard-phase", command: "harness-ship", ok: false }]);
  assert.equal(summary.totalEvents, 1);
  assert.deepEqual(summary.guardBlocks, [["harness-ship", 1]]);
});

test("buildEvalRecommendations maps guard blocks to eval tasks", () => {
  const fs = require("node:fs");
  const os = require("node:os");
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-recommend-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"guard-phase","command":"harness-verify","ok":false}\n',
    "utf8"
  );

  const result = buildEvalRecommendations(tempRoot);
  assert.ok(result.recommendations.some((item) => item.taskId === "sample-verify-md"));
});
