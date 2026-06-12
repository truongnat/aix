const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { uploadInsightsExport } = require(
  path.join(repoRoot, "dist", "features", "insights", "application", "upload-insights.js")
);

test("uploadInsightsExport skips when remote upload disabled", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-upload-skip-"));
  const result = await uploadInsightsExport(tempRoot);
  assert.equal(result.uploaded, false);
});

test("uploadInsightsExport posts payload when endpoint is provided", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-upload-ok-"));
  const harnessDir = path.join(tempRoot, ".harness");
  fs.mkdirSync(path.join(harnessDir, "history"), { recursive: true });
  fs.writeFileSync(
    path.join(harnessDir, "config.json"),
    JSON.stringify({
      telemetry: { export: { enabled: true, remoteUpload: { enabled: true } } },
    }),
    "utf8"
  );
  fs.writeFileSync(
    path.join(harnessDir, "history", "events.jsonl"),
    '{"type":"skill-run","skill":"verification"}\n',
    "utf8"
  );

  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 202 });

  try {
    const result = await uploadInsightsExport(tempRoot, {
      force: true,
      endpoint: "https://example.test/telemetry",
    });
    assert.equal(result.uploaded, true);
    assert.equal(result.status, 202);
  } finally {
    global.fetch = originalFetch;
  }
});
