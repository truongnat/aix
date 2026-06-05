"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAnonymizedExport = buildAnonymizedExport;
const node_crypto_1 = __importDefault(require("node:crypto"));
function mapToObject(rows) {
    return Object.fromEntries(rows);
}
function buildAnonymizedExport(summary, options = {}) {
    const aggregate = {
        totalEvents: summary.totalEvents,
        skills: mapToObject(summary.skills),
        guardBlocks: mapToObject(summary.guardBlocks),
        guardPasses: mapToObject(summary.guardPasses),
        tools: summary.tools.map((entry) => ({
            command: entry.command,
            count: entry.count,
            failures: entry.failures,
        })),
        subagents: mapToObject(summary.subagents),
    };
    const payload = {
        schema: "harness-insights-export-v1",
        generatedAt: new Date().toISOString(),
        anonymized: options.anonymize !== false,
        aggregate,
    };
    if (options.includeFingerprint) {
        payload.fingerprint = node_crypto_1.default
            .createHash("sha256")
            .update(JSON.stringify(aggregate))
            .digest("hex")
            .slice(0, 16);
    }
    return payload;
}
