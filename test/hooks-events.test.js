const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { appendHarnessEvent, resolveEventsPath } = require("../dist/hooks/shared/util.js");

test("appendHarnessEvent writes JSONL records under .harness/history", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-hook-events-"));
  appendHarnessEvent(tempRoot, { type: "skill-run", skill: "verification", status: "completed" });

  const eventsPath = resolveEventsPath(tempRoot);
  assert.ok(fs.existsSync(eventsPath));
  const lines = fs.readFileSync(eventsPath, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.type, "skill-run");
  assert.equal(parsed.skill, "verification");
  assert.equal(typeof parsed.ts, "string");
});
