// Purpose: Read harness config for telemetry upload settings.
// Layer: infrastructure
// Depends on: nothing

import fs from "node:fs";
import path from "node:path";

export interface HarnessConfig {
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

export interface RemoteUploadConfig {
  enabled: boolean;
  endpoint?: string;
  endpointEnv?: string;
  anonymize?: boolean;
}

export function readHarnessConfig(targetRoot: string): HarnessConfig {
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

export function resolveRemoteUploadConfig(targetRoot: string): RemoteUploadConfig {
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
