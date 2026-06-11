const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const { ingestTelemetryExport } = require(
  path.join(repoRoot, "dist", "features", "telemetry", "application", "ingest-telemetry.js")
);
const { defaultStoragePath } = require(
  path.join(repoRoot, "dist", "features", "telemetry", "infrastructure", "file-storage.js")
);

function makePayload() {
  return {
    schema: "harness-insights-export-v1",
    generatedAt: "2026-06-07T00:00:00.000Z",
    anonymized: true,
    aggregate: { totalEvents: 1 },
    fingerprint: "abc123",
  };
}

test("ingestTelemetryExport accepts valid payload", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-"));
  const result = ingestTelemetryExport(tempRoot, makePayload());
  assert.equal(result.ok, true);
  assert.equal(result.statusCode, 202);
  assert.ok(fs.existsSync(defaultStoragePath(tempRoot)));
});

test("ingestTelemetryExport rejects invalid payload without writing", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-invalid-"));
  const result = ingestTelemetryExport(tempRoot, { schema: "wrong" });
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 422);
  assert.ok(!fs.existsSync(defaultStoragePath(tempRoot)));
});

test("ingestTelemetryExport maps storage cap errors to 507", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-cap-"));
  const payload = makePayload();
  const encoded = `${JSON.stringify(payload)}\n`;
  const maxBytes = Buffer.byteLength(encoded);
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(defaultStoragePath(tempRoot), encoded, "utf8");
  const result = ingestTelemetryExport(tempRoot, payload, { maxStorageBytes: maxBytes });
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 507);
  assert.match(result.error || "", /Telemetry storage limit exceeded/);
});
