"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readHarnessConfig = readHarnessConfig;
exports.resolveRemoteUploadConfig = resolveRemoteUploadConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function readHarnessConfig(targetRoot) {
    const configPath = node_path_1.default.join(targetRoot, ".harness", "config.json");
    if (!node_fs_1.default.existsSync(configPath)) {
        return {};
    }
    return JSON.parse(node_fs_1.default.readFileSync(configPath, "utf8"));
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
