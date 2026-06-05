"use strict";

const fs = require("node:fs");
const path = require("node:path");

function readHarnessConfig(targetRoot) {
  const configPath = path.join(targetRoot, ".harness", "config.json");
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function resolveRemoteUploadConfig(targetRoot) {
  const config = readHarnessConfig(targetRoot);
  const exportConfig = config.telemetry && config.telemetry.export;
  if (!exportConfig || !exportConfig.remoteUpload || !exportConfig.remoteUpload.enabled) {
    return { enabled: false };
  }

  const endpointEnv = exportConfig.remoteUpload.endpointEnv || "HARNESS_TELEMETRY_ENDPOINT";
  return {
    enabled: true,
    endpoint: process.env[endpointEnv] || "",
    endpointEnv,
    anonymize: exportConfig.anonymize !== false,
  };
}

module.exports = {
  readHarnessConfig,
  resolveRemoteUploadConfig,
};
