const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { buildInsightsExport } = require(path.join(repoRoot, "dist", "features", "insights", "index.js"));

test("buildInsightsExport returns anonymized aggregate payload", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-export-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"skill-run","skill":"verification"}\n',
    "utf8"
  );

  const payload = buildInsightsExport(tempRoot);
  assert.equal(payload.schema, "harness-insights-export-v1");
  assert.equal(payload.anonymized, true);
  assert.equal(payload.aggregate.totalEvents, 1);
  assert.equal(payload.aggregate.skills.verification, 1);
  assert.ok(payload.fingerprint);
  assert.equal(payload.target, undefined);
});
