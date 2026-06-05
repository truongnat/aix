"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeModeArtifacts = writeModeArtifacts;
exports.writeRunSummary = writeRunSummary;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function writeModeArtifacts(modeDir, payload) {
    const summaryPath = node_path_1.default.join(modeDir, "summary.json");
    const metricsPath = node_path_1.default.join(modeDir, "metrics.json");
    const transcriptPath = node_path_1.default.join(modeDir, "transcript.md");
    const reportPath = node_path_1.default.join(modeDir, "report.md");
    node_fs_1.default.writeFileSync(summaryPath, JSON.stringify(payload.summary, null, 2));
    node_fs_1.default.writeFileSync(metricsPath, JSON.stringify(payload.metrics, null, 2));
    node_fs_1.default.writeFileSync(transcriptPath, payload.transcript);
    node_fs_1.default.writeFileSync(reportPath, payload.report);
    return { summaryPath, metricsPath, transcriptPath, reportPath };
}
function writeRunSummary(runRoot, payload) {
    const summaryPath = node_path_1.default.join(runRoot, "summary.json");
    node_fs_1.default.writeFileSync(summaryPath, JSON.stringify(payload, null, 2));
    return summaryPath;
}
