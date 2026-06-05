"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadInsightsExport = uploadInsightsExport;
const index_1 = require("./index");
const harness_config_1 = require("./harness-config");
async function uploadInsightsExport(targetRoot, options = {}) {
    const uploadConfig = (0, harness_config_1.resolveRemoteUploadConfig)(targetRoot);
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
    const payload = (0, index_1.buildInsightsExport)(targetRoot, {
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
