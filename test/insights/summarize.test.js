const { test } = require("node:test");
const assert = require("node:assert/strict");

const { summarizeEvents, formatInsightsText } = require("../../dist/features/insights/index.js");

test("summarizeEvents aggregates skills, guards, tools, and subagents", () => {
  const summary = summarizeEvents([
    { type: "skill-run", skill: "verification", status: "completed" },
    { type: "skill-run", skill: "verification", status: "completed" },
    { type: "guard-phase", command: "harness-run", ok: false },
    { type: "guard-phase", command: "harness-run", ok: true },
    { type: "tool-run", command: "npm test", exit_code: 1 },
    { type: "tool-run", command: "npm test", exit_code: 0 },
    { type: "subagent-run", agent: "reviewer", status: "issues-found" },
  ]);

  assert.equal(summary.totalEvents, 7);
  assert.deepEqual(summary.skills, [["verification", 2]]);
  assert.deepEqual(summary.guardBlocks, [["harness-run", 1]]);
  assert.deepEqual(summary.guardPasses, [["harness-run", 1]]);
  assert.equal(summary.tools[0].command, "npm test");
  assert.equal(summary.tools[0].count, 2);
  assert.equal(summary.tools[0].failures, 1);
  assert.deepEqual(summary.subagents, [["reviewer", 1]]);
});

test("formatInsightsText renders empty sections", () => {
  const text = formatInsightsText(
    {
      totalEvents: 0,
      skills: [],
      guardBlocks: [],
      guardPasses: [],
      tools: [],
      subagents: [],
    },
    ".harness/history/events.jsonl"
  );

  assert.match(text, /Events: 0/);
  assert.match(text, /Skills:\n {2}\(none\)/);
});
