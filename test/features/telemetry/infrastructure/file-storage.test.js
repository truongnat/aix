const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const { defaultStoragePath, appendTelemetryExport } = require(
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

test("defaultStoragePath points to harness-telemetry.ndjson", () => {
  const dir = path.join(os.tmpdir(), "telemetry-dir");
  assert.equal(defaultStoragePath(dir), path.join(dir, "harness-telemetry.ndjson"));
});

test("appendTelemetryExport writes one NDJSON line", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-storage-"));
  const payload = makePayload();
  const result = appendTelemetryExport(tempRoot, payload);
  const storagePath = defaultStoragePath(tempRoot);
  assert.ok(fs.existsSync(storagePath));
  const lines = fs.readFileSync(storagePath, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).fingerprint, "abc123");
  assert.equal(result.bytesWritten, Buffer.byteLength(`${JSON.stringify(payload)}\n`));
});

test("appendTelemetryExport throws when storage cap exceeded", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-storage-cap-"));
  const payload = makePayload();
  const encoded = `${JSON.stringify(payload)}\n`;
  const maxBytes = Buffer.byteLength(encoded);
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(defaultStoragePath(tempRoot), encoded, "utf8");
  assert.throws(
    () => appendTelemetryExport(tempRoot, payload, maxBytes),
    /Telemetry storage limit exceeded/
  );
});
