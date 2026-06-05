import { buildInsightsExport } from "./index";
import { resolveRemoteUploadConfig, type RemoteUploadConfig } from "./harness-config";

interface UploadOptions {
  force?: boolean;
  endpoint?: string;
  authHeader?: string;
}

interface UploadResult {
  uploaded: boolean;
  reason?: string;
  endpoint?: string;
  status?: number;
  fingerprint?: string;
}

async function uploadInsightsExport(
  targetRoot: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const uploadConfig = resolveRemoteUploadConfig(targetRoot);
  if (!uploadConfig.enabled && !options.force) {
    return {
      uploaded: false,
      reason: "remoteUpload.enabled is false in .harness/config.json",
    };
  }

  const endpoint = options.endpoint || uploadConfig.endpoint;
  if (!endpoint) {
    return {
      uploaded: false,
      reason: `Missing endpoint env ${uploadConfig.endpointEnv || "HARNESS_TELEMETRY_ENDPOINT"}`,
    };
  }

  const payload = buildInsightsExport(targetRoot, {
    anonymize: uploadConfig.anonymize,
    includeFingerprint: true,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.authHeader ? { authorization: options.authHeader } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telemetry upload failed (${response.status}): ${body}`);
  }

  return {
    uploaded: true,
    endpoint,
    status: response.status,
    fingerprint: payload.fingerprint,
  };
}

export { uploadInsightsExport };
export type { UploadOptions, UploadResult };
