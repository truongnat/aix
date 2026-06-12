// Purpose: Upload anonymized insights export to configured remote endpoint.
// Layer: application
// Depends on: build-insights, harness-config, http-upload

import { buildInsightsExport } from "./build-insights";
import { resolveRemoteUploadConfig } from "../infrastructure/harness-config";
import { postJsonPayload } from "../infrastructure/http-upload";

export interface UploadOptions {
  force?: boolean;
  endpoint?: string;
  authHeader?: string;
}

export interface UploadResult {
  uploaded: boolean;
  reason?: string;
  endpoint?: string;
  status?: number;
  fingerprint?: string;
}

export async function uploadInsightsExport(
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

  const response = await postJsonPayload({
    endpoint,
    payload,
    authHeader: options.authHeader,
  });

  return {
    uploaded: true,
    endpoint,
    status: response.status,
    fingerprint: payload.fingerprint,
  };
}
