const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const {
  DEFAULT_MAX_STORAGE_BYTES,
  handleTelemetryRequest,
  validateTelemetryPayload,
  defaultStoragePath,
} = require(path.join(repoRoot, "dist", "features", "telemetry", "index.js"));

function makeResponse() {
  let body = "";
  const headers = {};
  return {
    statusCode: 0,
    headers,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    end(chunk) {
      body += chunk || "";
      this.body = body;
      this.finished = true;
    },
  };
}

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

test("validateTelemetryPayload accepts a harness insights export payload", () => {
  assert.equal(validateTelemetryPayload(makePayload()), true);
  assert.equal(validateTelemetryPayload({}), false);
});

test("telemetry ingest handler stores accepted exports", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-telemetry-"));
  const req = Readable.from([JSON.stringify(makePayload())]);
  req.method = "POST";
  req.url = "/api/telemetry";

  const res = makeResponse();
  const result = await handleTelemetryRequest(req, res, {
    storageDir: tempRoot,
    routePath: "/api/telemetry",
  });

  assert.equal(result.accepted, true);
  assert.equal(result.statusCode, 202);
  assert.equal(res.statusCode, 202);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.schema, "harness-insights-export-v1");

  const storagePath = defaultStoragePath(tempRoot);
  assert.ok(fs.existsSync(storagePath));
  const lines = fs.readFileSync(storagePath, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  const stored = JSON.parse(lines[0]);
  assert.equal(stored.fingerprint, "abc123");
  assert.equal(stored.aggregate.totalEvents, 1);
});

test("telemetry ingest handler rejects invalid exports without writing", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-telemetry-invalid-"));
  const req = Readable.from(['{"schema":"wrong"}']);
  req.method = "POST";
  req.url = "/api/telemetry";

  const res = makeResponse();
  const result = await handleTelemetryRequest(req, res, {
    storageDir: tempRoot,
    routePath: "/api/telemetry",
  });

  assert.equal(result.accepted, false);
  assert.equal(result.statusCode, 422);
  assert.equal(res.statusCode, 422);
  assert.ok(!fs.existsSync(defaultStoragePath(tempRoot)));
});

test("telemetry ingest handler rejects writes once storage cap is exceeded", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-telemetry-cap-"));
  const storagePath = defaultStoragePath(tempRoot);
  const payload = makePayload();
  const encoded = `${JSON.stringify(payload)}\n`;
  const maxStorageBytes = Buffer.byteLength(encoded);

  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(storagePath, encoded, "utf8");

  const req = Readable.from([JSON.stringify(payload)]);
  req.method = "POST";
  req.url = "/api/telemetry";

  const res = makeResponse();
  const result = await handleTelemetryRequest(req, res, {
    storageDir: tempRoot,
    routePath: "/api/telemetry",
    maxStorageBytes,
  });

  assert.equal(result.accepted, false);
  assert.equal(result.statusCode, 507);
  assert.equal(res.statusCode, 507);
  assert.match(res.body, /Telemetry storage limit exceeded/);
  assert.equal(fs.readFileSync(storagePath, "utf8"), encoded);
});

test("telemetry storage default cap remains 50 MB", () => {
  assert.equal(DEFAULT_MAX_STORAGE_BYTES, 50 * 1024 * 1024);
});
