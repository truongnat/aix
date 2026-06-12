const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  readEvents,
  resolveEventsPath,
} = require("../../dist/features/insights/infrastructure/event-reader.js");
const { buildInsights } = require("../../dist/features/insights/index.js");

test("readEvents skips malformed lines and parses valid events", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-insights-"));
  const eventsPath = path.join(tempRoot, "events.jsonl");
  fs.writeFileSync(
    eventsPath,
    [
      '{"type":"skill-run","skill":"verification"}',
      "not-json",
      '{"type":"tool-run","command":"npm test","exit_code":0}',
    ].join("\n")
  );

  const events = readEvents(eventsPath);
  assert.equal(events.length, 2);
  assert.equal(events[0].skill, "verification");
});

test("buildInsights reads target .harness/history/events.jsonl", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-insights-target-"));
  const eventsPath = resolveEventsPath(tempRoot);
  fs.mkdirSync(path.dirname(eventsPath), { recursive: true });
  fs.writeFileSync(
    eventsPath,
    '{"type":"guard-phase","command":"harness-ship","ok":false}\n',
    "utf8"
  );

  const result = buildInsights(tempRoot);
  assert.equal(result.summary.totalEvents, 1);
  assert.deepEqual(result.summary.guardBlocks, [["harness-ship", 1]]);
  assert.match(result.output, /harness-ship: 1/);
});
