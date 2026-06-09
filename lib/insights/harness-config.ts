import fs from "node:fs";
import path from "node:path";

interface HarnessConfig {
  telemetry?: {
    export?: {
      remoteUpload?: {
        enabled?: boolean;
        endpointEnv?: string;
      };
      anonymize?: boolean;
    };
  };
}

interface RemoteUploadConfig {
  enabled: boolean;
  endpoint?: string;
  endpointEnv?: string;
  anonymize?: boolean;
}

function readHarnessConfig(targetRoot: string): HarnessConfig {
  const configPath = path.join(targetRoot, ".harness", "config.json");
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
}

function resolveRemoteUploadConfig(targetRoot: string): RemoteUploadConfig {
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

export { readHarnessConfig, resolveRemoteUploadConfig };
export type { HarnessConfig, RemoteUploadConfig };
