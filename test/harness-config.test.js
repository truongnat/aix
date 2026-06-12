const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

describe("readHarnessConfig", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aih-harness-cfg-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns {} when config file is missing", () => {
    const { readHarnessConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const result = readHarnessConfig(tmpDir);
    assert.deepEqual(result, {});
  });

  it("returns {} when config file has invalid JSON", () => {
    const { readHarnessConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, "config.json"), "NOT VALID JSON!!!");
    const result = readHarnessConfig(tmpDir);
    assert.deepEqual(result, {});
  });

  it("reads valid config", () => {
    const { readHarnessConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    const config = {
      telemetry: {
        export: {
          remoteUpload: { enabled: true, endpointEnv: "MY_ENDPOINT" },
          anonymize: true,
        },
      },
    };
    fs.writeFileSync(path.join(configDir, "config.json"), JSON.stringify(config));
    const result = readHarnessConfig(tmpDir);
    assert.deepEqual(result, config);
  });
});

describe("resolveRemoteUploadConfig", () => {
  let tmpDir;
  const savedEnv = {};

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aih-harness-remote-"));
    savedEnv.HARNESS_TELEMETRY_ENDPOINT = process.env.HARNESS_TELEMETRY_ENDPOINT;
    savedEnv.CUSTOM_ENDPOINT = process.env.CUSTOM_ENDPOINT;
    delete process.env.HARNESS_TELEMETRY_ENDPOINT;
    delete process.env.CUSTOM_ENDPOINT;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (savedEnv.HARNESS_TELEMETRY_ENDPOINT !== undefined) {
      process.env.HARNESS_TELEMETRY_ENDPOINT = savedEnv.HARNESS_TELEMETRY_ENDPOINT;
    } else {
      delete process.env.HARNESS_TELEMETRY_ENDPOINT;
    }
    if (savedEnv.CUSTOM_ENDPOINT !== undefined) {
      process.env.CUSTOM_ENDPOINT = savedEnv.CUSTOM_ENDPOINT;
    } else {
      delete process.env.CUSTOM_ENDPOINT;
    }
  });

  it("returns disabled when no config file", () => {
    const { resolveRemoteUploadConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const result = resolveRemoteUploadConfig(tmpDir);
    assert.equal(result.enabled, false);
  });

  it("returns disabled when remoteUpload.enabled is false", () => {
    const { resolveRemoteUploadConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.json"),
      JSON.stringify({
        telemetry: {
          export: {
            remoteUpload: { enabled: false },
          },
        },
      })
    );
    const result = resolveRemoteUploadConfig(tmpDir);
    assert.equal(result.enabled, false);
  });

  it("returns endpoint from env var", () => {
    const { resolveRemoteUploadConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.json"),
      JSON.stringify({
        telemetry: {
          export: {
            remoteUpload: { enabled: true, endpointEnv: "CUSTOM_ENDPOINT" },
            anonymize: true,
          },
        },
      })
    );
    process.env.CUSTOM_ENDPOINT = "https://example.com/upload";
    const result = resolveRemoteUploadConfig(tmpDir);
    assert.equal(result.enabled, true);
    assert.equal(result.endpoint, "https://example.com/upload");
    assert.equal(result.endpointEnv, "CUSTOM_ENDPOINT");
    assert.equal(result.anonymize, true);
  });

  it("uses default env var name when endpointEnv not specified", () => {
    const { resolveRemoteUploadConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.json"),
      JSON.stringify({
        telemetry: {
          export: {
            remoteUpload: { enabled: true },
          },
        },
      })
    );
    process.env.HARNESS_TELEMETRY_ENDPOINT = "https://default.example.com";
    const result = resolveRemoteUploadConfig(tmpDir);
    assert.equal(result.enabled, true);
    assert.equal(result.endpoint, "https://default.example.com");
    assert.equal(result.endpointEnv, "HARNESS_TELEMETRY_ENDPOINT");
  });

  it("returns empty endpoint when env var not set", () => {
    const { resolveRemoteUploadConfig } = fresh("dist/features/insights/infrastructure/harness-config.js");
    const configDir = path.join(tmpDir, ".harness");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.json"),
      JSON.stringify({
        telemetry: {
          export: {
            remoteUpload: { enabled: true },
          },
        },
      })
    );
    const result = resolveRemoteUploadConfig(tmpDir);
    assert.equal(result.enabled, true);
    assert.equal(result.endpoint, "");
  });
});
