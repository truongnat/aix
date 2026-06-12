const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const { TELEMETRY_SCHEMA_ID, DEFAULT_MAX_STORAGE_BYTES, validateTelemetryPayload } = require(
  path.join(repoRoot, "dist", "features", "telemetry", "domain", "telemetry-payload.js")
);

function makePayload() {
  return {
    schema: "harness-insights-export-v1",
    generatedAt: "2026-06-07T00:00:00.000Z",
    anonymized: true,
    aggregate: {
      totalEvents: 1,
      skills: { verification: 1 },
      guardBlocks: {},
      guardPasses: {},
      tools: [],
      subagents: {},
    },
    fingerprint: "abc123",
  };
}

test("TELEMETRY_SCHEMA_ID matches harness insights export v1", () => {
  assert.equal(TELEMETRY_SCHEMA_ID, "harness-insights-export-v1");
});

test("DEFAULT_MAX_STORAGE_BYTES is 50 MB", () => {
  assert.equal(DEFAULT_MAX_STORAGE_BYTES, 50 * 1024 * 1024);
});

test("validateTelemetryPayload accepts valid export", () => {
  assert.equal(validateTelemetryPayload(makePayload()), true);
});

test("validateTelemetryPayload rejects empty object", () => {
  assert.equal(validateTelemetryPayload({}), false);
});

test("validateTelemetryPayload rejects wrong schema", () => {
  assert.equal(validateTelemetryPayload({ ...makePayload(), schema: "wrong" }), false);
});
